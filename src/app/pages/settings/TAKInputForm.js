import React, { useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
    Alert,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Divider,
    FormControlLabel,
    Grid,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { CommsContext } from '../../contexts/CommsContext';

function LabeledField({ label, name, value, onChange, type = 'text' }) {
    return (
        <Grid item xs={12} sm={6}>
            <TextField
                label={label}
                name={name}
                value={value ?? ''}
                onChange={onChange}
                fullWidth
                size="small"
                type={type}
                InputLabelProps={{ shrink: true }}
            />
        </Grid>
    );
}

function LabeledCheck({ label, name, checked, onChange }) {
    return (
        <Grid item xs={12} sm={6}>
            <FormControlLabel
                label={label}
                control={<Checkbox name={name} checked={!!checked} onChange={onChange} />}
            />
        </Grid>
    );
}

export default function TAKInputForm() {
    const { getServerHost } = useContext(CommsContext);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [quickEnrollBusy, setQuickEnrollBusy] = useState(false);
    const [takStatus, setTakStatus] = useState({ connected: false, enabled: false, uid: '', lastSendMs: 0 });
    const [enrollStatus, setEnrollStatus] = useState({ enrolled: false, certExists: false, keyExists: false });
    const [qrData, setQrData] = useState({ host: '', username: '', token: '', uri: '' });
    const [atakEnrollLinkInput, setAtakEnrollLinkInput] = useState('');
    const [takConfig, setTakConfig] = useState({
        takEnabled: false,
        takSSL: true,
        takVerifyCert: true,
        takPersistent: true,
        takUDPEnabled: false,
        takUseClientCert: true,
        takServer: '',
        takPort: 8089,
        takUDPPort: 6969,
        takCallsign: 'HaptiCap',
        takUID: '',
        takCotType: 'a-f-G-U-C',
        takIntervalSec: 30,
        takCACertPath: '/certs/tak_ca.crt',
        takEnrollPort: 8446,
        takEnrollHost: '',
        takEnrollUsername: '',
        takEnrollToken: '',
        takAutoTokenFetch: false,
        takTokenApiPath: '/api/tokens/current',
        takTokenApiUsername: '',
        takTokenApiPassword: '',
        takEnrollPath: '/Marti/api/tls/signClient/v2',
        takClientCertPath: '/certs/tak_client.crt',
        takClientKeyPath: '/certs/tak_client.key',
        takClientP12Path: '/certs/tak_client.p12',
    });

    const serverHost = useMemo(() => getServerHost(), [getServerHost]);

    function setMessage({ err = '', ok = '', status = '' }) {
        setError(err);
        setSuccess(ok);
        setStatusMessage(status);
    }

    async function loadAll() {
        try {
            const [cfgRes, statusRes, qrRes, enrollRes] = await Promise.all([
                axios.get(serverHost + '/tak/config'),
                axios.get(serverHost + '/tak/status'),
                axios.get(serverHost + '/tak/enrollment-qr-data'),
                axios.get(serverHost + '/tak/enroll-status'),
            ]);
            setTakConfig((prev) => ({ ...prev, ...cfgRes.data }));
            setTakStatus(statusRes.data || {});
            setQrData(qrRes.data || {});
            setEnrollStatus(enrollRes.data || {});
            setMessage({});
        } catch (e) {
            setMessage({ err: e.response?.data?.message || 'Failed to load TAK data' });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadAll();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    function handleInputChange(event) {
        const { name, value } = event.target;
        setTakConfig((prev) => ({ ...prev, [name]: value }));
    }

    function handleCheckChange(event) {
        const { name, checked } = event.target;
        setTakConfig((prev) => ({ ...prev, [name]: checked }));
    }

    function sanitizeConfigForSave(cfg) {
        const cleaned = { ...cfg };

        // Defensive cleanup: users sometimes paste hosts with scheme/trailing slash.
        const trimHost = (value) => String(value || '').trim().replace(/^https?:\/\//i, '').replace(/\/+$/g, '');
        cleaned.takServer = trimHost(cleaned.takServer);
        cleaned.takEnrollHost = trimHost(cleaned.takEnrollHost);

        return cleaned;
    }

    async function saveConfigInternal(showSuccess = true) {
        const payload = sanitizeConfigForSave(takConfig);
        try {
            await axios.post(serverHost + '/tak/config', payload, {
                headers: { 'Content-Type': 'application/json' },
            });
            if (showSuccess) {
                setMessage({ ok: 'TAK settings saved' });
            }
            setTakConfig((prev) => ({ ...prev, ...payload }));
            await loadAll();
            return true;
        } catch (e) {
            setMessage({ err: e.response?.data?.message || 'Failed to save TAK settings' });
            return false;
        }
    }

    async function saveConfig() {
        await saveConfigInternal(true);
    }

    async function postSimple(endpoint, okText, options = {}) {
        const { saveFirst = false } = options;
        try {
            if (saveFirst) {
                const saved = await saveConfigInternal(false);
                if (!saved) {
                    return;
                }
            }
            const response = await axios.post(serverHost + endpoint, null, {
                headers: { 'Content-Type': 'application/json' },
            });
            const apiMessage = response.data?.message || okText;
            setMessage({ ok: okText, status: apiMessage });
            await loadAll();
        } catch (e) {
            setMessage({ err: e.response?.data?.message || `Failed: ${endpoint}` });
        }
    }

    function parseAtakEnrollUri(uriText) {
        const raw = String(uriText || '').trim();
        if (!raw) {
            throw new Error('Paste an ATAK enrollment link first');
        }

        let uri;
        try {
            uri = new URL(raw);
        } catch (e) {
            throw new Error('Invalid enrollment URI format');
        }

        if (!uri.protocol || uri.protocol.toLowerCase() !== 'tak:') {
            throw new Error('Expected a tak:// enrollment URI');
        }

        const host = (uri.searchParams.get('host') || '').trim();
        const username = (uri.searchParams.get('username') || '').trim();
        const token = (uri.searchParams.get('token') || '').trim();

        if (!host) {
            throw new Error('Enrollment URI is missing host');
        }
        if (!username) {
            throw new Error('Enrollment URI is missing username');
        }
        if (!token) {
            throw new Error('Enrollment URI is missing token');
        }

        return { host, username, token };
    }

    function buildTakConfigFromAtakUri(baseConfig, uriText) {
        const parsed = parseAtakEnrollUri(uriText);
        return {
            ...baseConfig,
            takEnrollHost: parsed.host,
            takEnrollUsername: parsed.username,
            takEnrollToken: parsed.token,
            // Keep streaming and enrollment host aligned for a single flow.
            takServer: parsed.host,
            takEnrollPort: 8446,
            takEnrollPath: '/Marti/api/tls/signClient/v2',
            takPort: 8089,
        };
    }

    function importAtakEnrollLink() {
        try {
            const nextConfig = buildTakConfigFromAtakUri(takConfig, atakEnrollLinkInput);
            setTakConfig(nextConfig);
            setMessage({ ok: 'ATAK enrollment link imported. Save and click Re-enroll Device.' });
        } catch (e) {
            setMessage({ err: e.message || 'Failed to parse ATAK enrollment link' });
        }
    }

    async function quickEnrollFromUri(uriText) {
        setQuickEnrollBusy(true);
        try {
            const nextConfig = buildTakConfigFromAtakUri(takConfig, uriText);
            const payload = sanitizeConfigForSave(nextConfig);

            await axios.post(serverHost + '/tak/config', payload, {
                headers: { 'Content-Type': 'application/json' },
            });
            setTakConfig(payload);

            const response = await axios.post(serverHost + '/tak/reenroll', null, {
                headers: { 'Content-Type': 'application/json' },
            });

            const apiMessage = response.data?.message || 'Device reenrollment started';
            setMessage({ ok: 'ATAK link applied and reenrollment requested', status: apiMessage });
            await loadAll();
        } catch (e) {
            setMessage({ err: e.response?.data?.message || e.message || 'Quick enrollment failed' });
        } finally {
            setQuickEnrollBusy(false);
        }
    }

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box component="form">
            <Typography variant="h6" gutterBottom>TAK / ATAK Integration</Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Import ATAK Enrollment Link</Typography>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="ATAK Link (tak://...)"
                        value={atakEnrollLinkInput}
                        onChange={(event) => setAtakEnrollLinkInput(event.target.value)}
                        fullWidth
                        size="small"
                        multiline
                        minRows={2}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
                        <Button variant="outlined" type="button" onClick={importAtakEnrollLink}>Import Link Into TAK Config</Button>
                        <Button variant="text" type="button" onClick={() => setAtakEnrollLinkInput(qrData.uri || '')}>Use Device QR URI</Button>
                        <Button
                            variant="contained"
                            type="button"
                            onClick={() => quickEnrollFromUri(atakEnrollLinkInput || qrData.uri || '')}
                            disabled={quickEnrollBusy}
                        >
                            {quickEnrollBusy ? 'Starting enrollment...' : 'Quick Enroll From ATAK Link'}
                        </Button>
                    </Stack>
                </Grid>

                <LabeledCheck label="TAK Enabled" name="takEnabled" checked={takConfig.takEnabled} onChange={handleCheckChange} />
                <LabeledCheck label="Use SSL/TLS" name="takSSL" checked={takConfig.takSSL} onChange={handleCheckChange} />
                <LabeledCheck label="Verify Certificate" name="takVerifyCert" checked={takConfig.takVerifyCert} onChange={handleCheckChange} />
                <LabeledCheck label="Persistent TCP" name="takPersistent" checked={takConfig.takPersistent} onChange={handleCheckChange} />
                <LabeledCheck label="Enable UDP CoT" name="takUDPEnabled" checked={takConfig.takUDPEnabled} onChange={handleCheckChange} />
                <LabeledCheck label="Use Client Certificate" name="takUseClientCert" checked={takConfig.takUseClientCert} onChange={handleCheckChange} />

                <LabeledField label="TAK Server" name="takServer" value={takConfig.takServer} onChange={handleInputChange} />
                <LabeledField label="TAK TCP Port" name="takPort" value={takConfig.takPort} onChange={handleInputChange} type="number" />
                <LabeledField label="TAK UDP Port" name="takUDPPort" value={takConfig.takUDPPort} onChange={handleInputChange} type="number" />
                <LabeledField label="Callsign" name="takCallsign" value={takConfig.takCallsign} onChange={handleInputChange} />
                <LabeledField label="UID" name="takUID" value={takConfig.takUID} onChange={handleInputChange} />
                <LabeledField label="CoT Type" name="takCotType" value={takConfig.takCotType} onChange={handleInputChange} />
                <LabeledField label="Send Interval (sec)" name="takIntervalSec" value={takConfig.takIntervalSec} onChange={handleInputChange} type="number" />
                <LabeledField label="CA Cert Path" name="takCACertPath" value={takConfig.takCACertPath} onChange={handleInputChange} />

                <LabeledField label="Enroll Host" name="takEnrollHost" value={takConfig.takEnrollHost} onChange={handleInputChange} />
                <LabeledField label="Enroll Port" name="takEnrollPort" value={takConfig.takEnrollPort} onChange={handleInputChange} type="number" />
                <LabeledField label="Enroll Username" name="takEnrollUsername" value={takConfig.takEnrollUsername} onChange={handleInputChange} />
                <LabeledField label="Enroll Token" name="takEnrollToken" value={takConfig.takEnrollToken} onChange={handleInputChange} />
                <LabeledCheck label="Auto Token Fetch" name="takAutoTokenFetch" checked={takConfig.takAutoTokenFetch} onChange={handleCheckChange} />
                <LabeledField label="Token API Path" name="takTokenApiPath" value={takConfig.takTokenApiPath} onChange={handleInputChange} />
                <LabeledField label="Token API Username" name="takTokenApiUsername" value={takConfig.takTokenApiUsername} onChange={handleInputChange} />
                <LabeledField label="Token API Password" name="takTokenApiPassword" value={takConfig.takTokenApiPassword} onChange={handleInputChange} />

                <LabeledField label="Enroll Path" name="takEnrollPath" value={takConfig.takEnrollPath} onChange={handleInputChange} />
                <LabeledField label="Client Cert Path" name="takClientCertPath" value={takConfig.takClientCertPath} onChange={handleInputChange} />
                <LabeledField label="Client Key Path" name="takClientKeyPath" value={takConfig.takClientKeyPath} onChange={handleInputChange} />
                <LabeledField label="Client P12 Path" name="takClientP12Path" value={takConfig.takClientP12Path} onChange={handleInputChange} />
            </Grid>

            <Stack direction="row" spacing={1.5} sx={{ mb: 2, flexWrap: 'wrap' }}>
                <Button variant="contained" type="button" onClick={saveConfig}>Save TAK Config</Button>
                <Button variant="outlined" type="button" onClick={() => postSimple('/tak/connect', 'TAK connect requested', { saveFirst: true })}>Connect</Button>
                <Button variant="outlined" type="button" onClick={() => postSimple('/tak/disconnect', 'TAK disconnect requested')}>Disconnect</Button>
                <Button variant="outlined" type="button" onClick={() => postSimple('/tak/enrollment-qr-token/refresh', 'Token refresh requested', { saveFirst: true })}>Refresh Token</Button>
                <Button variant="outlined" type="button" onClick={() => postSimple('/tak/enroll', 'Device enrollment started', { saveFirst: true })}>Enroll Device</Button>
                <Button variant="outlined" type="button" onClick={() => postSimple('/tak/reenroll', 'Device reenrollment started', { saveFirst: true })}>Re-enroll Device</Button>
                <Button variant="text" type="button" onClick={loadAll}>Refresh Status</Button>
            </Stack>

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                TAK Status: {takStatus.connected ? 'Connected' : 'Disconnected'} | Enabled: {takStatus.enabled ? 'Yes' : 'No'} | UID: {takStatus.uid || '-'}
            </Typography>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Enrollment: {enrollStatus.enrolled ? 'Loaded' : 'Not loaded'} | Cert: {enrollStatus.certExists ? 'Yes' : 'No'} | Key: {enrollStatus.keyExists ? 'Yes' : 'No'}
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Typography variant="subtitle1" gutterBottom>ATAK Enrollment URI</Typography>
            <TextField
                value={qrData.uri || ''}
                fullWidth
                size="small"
                multiline
                minRows={2}
                InputProps={{ readOnly: true }}
                sx={{ mb: 2 }}
            />

            {!!qrData.uri && (
                <Box sx={{ mb: 2 }}>
                    <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(qrData.uri)}`}
                        alt="ATAK enrollment QR"
                        width={260}
                        height={260}
                    />
                </Box>
            )}

            {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 1 }}>{success}</Alert>}
            {statusMessage && <Alert severity="info">{statusMessage}</Alert>}
        </Box>
    );
}
