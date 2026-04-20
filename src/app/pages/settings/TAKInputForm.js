import React, { useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import JSZip from 'jszip';
import forge from 'node-forge';
import {
    Alert,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    FormControlLabel,
    Grid,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { XMLParser } from 'fast-xml-parser';
import { CommsContext } from '../../contexts/CommsContext';

const TAK_TYPE_PRESET_DEFAULT = 'atak_phone';
const TAK_TYPE_PRESETS = [
    { value: 'atak_phone', label: 'ATAK Phone', cotType: 'a-f-G-U-C' },
    { value: 'team_lead', label: 'Team Lead', cotType: 'a-f-G-U-C' },
    { value: 'generic_friendly', label: 'Generic Friendly Unit', cotType: 'a-f-G-U-C' },
    { value: 'unknown_pending', label: 'Unknown / Pending', cotType: 'a-u-G' },
];

function resolveCotTypeFromPreset(presetValue) {
    const selectedPreset = TAK_TYPE_PRESETS.find((item) => item.value === presetValue);
    return selectedPreset?.cotType || 'a-f-G-U-C';
}

function resolvePresetFromCotType(cotType) {
    if (String(cotType || '').trim() === 'a-u-G') {
        return 'unknown_pending';
    }
    return TAK_TYPE_PRESET_DEFAULT;
}

function ensureArray(value) {
    if (!value) {
        return [];
    }
    return Array.isArray(value) ? value : [value];
}

function binaryStringFromArrayBuffer(arrayBuffer) {
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let index = 0; index < bytes.length; index += 1) {
        binary += String.fromCharCode(bytes[index]);
    }
    return binary;
}

function extractTopLevelDataFolder(zip) {
    const topLevelFolders = new Set();

    Object.keys(zip.files).forEach((entryName) => {
        const normalized = entryName.replace(/^\/+/, '');
        if (!normalized) {
            return;
        }
        const topLevel = normalized.split('/')[0];
        if (topLevel) {
            topLevelFolders.add(topLevel);
        }
    });

    const dataFolders = Array.from(topLevelFolders).filter((name) => name.toLowerCase() !== 'manifest');
    if (dataFolders.length !== 1) {
        throw new Error(`Expected exactly one data folder beside manifest, found ${dataFolders.length}`);
    }

    return dataFolders[0];
}

function parseConnectString(connectString) {
    const parts = String(connectString || '').trim().split(':');
    if (parts.length < 3) {
        throw new Error('Package connectString0 is invalid');
    }

    const host = parts[0]?.trim();
    const port = Number(parts[1]);
    const mode = String(parts[2] || '').trim().toLowerCase();

    if (!host || Number.isNaN(port) || port <= 0) {
        throw new Error('Package connectString0 is missing host or port');
    }

    return {
        takServer: host,
        takPort: port,
        takSSL: mode === 'ssl' || mode === 'tls',
    };
}

function parsePreferenceXml(xmlText) {
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '',
        trimValues: true,
        parseTagValue: false,
    });
    const xml = parser.parse(xmlText);
    const preferences = ensureArray(xml?.preferences?.preference);
    const entryMap = new Map();

    preferences.forEach((preference) => {
        ensureArray(preference?.entry).forEach((entry) => {
            if (entry?.key) {
                entryMap.set(entry.key, typeof entry === 'object' ? entry['#text'] || '' : '');
            }
        });
    });

    return {
        description: entryMap.get('description0') || '',
        connectString: entryMap.get('connectString0') || '',
        caPassword: entryMap.get('caPassword') || '',
        clientPassword: entryMap.get('clientPassword') || '',
    };
}

function getFirstBagValue(bags) {
    return Array.isArray(bags) && bags.length > 0 ? bags[0] : null;
}

function parseClientP12(arrayBuffer, password) {
    const der = forge.util.createBuffer(binaryStringFromArrayBuffer(arrayBuffer));
    const asn1 = forge.asn1.fromDer(der);
    const p12 = forge.pkcs12.pkcs12FromAsn1(asn1, false, password);
    const certBag = getFirstBagValue(p12.getBags({ bagType: forge.pki.oids.certBag })?.[forge.pki.oids.certBag]);
    const keyBag = getFirstBagValue(p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })?.[forge.pki.oids.pkcs8ShroudedKeyBag])
        || getFirstBagValue(p12.getBags({ bagType: forge.pki.oids.keyBag })?.[forge.pki.oids.keyBag]);

    if (!certBag?.cert || !keyBag?.key) {
        throw new Error('Client PKCS#12 did not contain both a certificate and private key');
    }

    return {
        clientCertPem: forge.pki.certificateToPem(certBag.cert),
        clientKeyPem: forge.pki.privateKeyToPem(keyBag.key),
    };
}

function parseTruststoreP12(arrayBuffer, password) {
    const der = forge.util.createBuffer(binaryStringFromArrayBuffer(arrayBuffer));
    const asn1 = forge.asn1.fromDer(der);
    const p12 = forge.pkcs12.pkcs12FromAsn1(asn1, false, password);
    const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })?.[forge.pki.oids.certBag] || [];

    if (certBags.length === 0) {
        throw new Error('Truststore PKCS#12 did not contain any certificates');
    }

    return certBags.map((bag) => forge.pki.certificateToPem(bag.cert)).join('\n');
}

async function parseTakPackage(file) {
    const outerZip = await JSZip.loadAsync(await file.arrayBuffer());
    const outerDataFolder = extractTopLevelDataFolder(outerZip);
    const nestedZipEntry = Object.values(outerZip.files).find((entry) => {
        if (entry.dir) {
            return false;
        }
        const lowerName = entry.name.toLowerCase();
        return lowerName.startsWith(`${outerDataFolder.toLowerCase()}/`) && lowerName.endsWith('.zip');
    });

    if (!nestedZipEntry) {
        throw new Error('The uploaded package did not contain a nested zip in its data folder');
    }

    const innerZip = await JSZip.loadAsync(await nestedZipEntry.async('arraybuffer'));
    const innerDataFolder = extractTopLevelDataFolder(innerZip);
    const innerEntries = Object.values(innerZip.files).filter((entry) => !entry.dir && entry.name.startsWith(`${innerDataFolder}/`));
    const preferenceEntry = innerEntries.find((entry) => entry.name.toLowerCase().endsWith('preference.pref'));
    const truststoreEntry = innerEntries.find((entry) => entry.name.toLowerCase().endsWith('truststore-root.p12'));
    const clientP12Entries = innerEntries.filter((entry) => entry.name.toLowerCase().endsWith('.p12') && !entry.name.toLowerCase().endsWith('truststore-root.p12'));

    if (!preferenceEntry || !truststoreEntry || clientP12Entries.length !== 1) {
        throw new Error('The nested package must contain preference.pref, truststore-root.p12, and exactly one client .p12');
    }

    const preferenceXml = await preferenceEntry.async('string');
    const preferenceData = parsePreferenceXml(preferenceXml);
    const connection = parseConnectString(preferenceData.connectString);
    const clientP12Buffer = await clientP12Entries[0].async('arraybuffer');
    const truststoreBuffer = await truststoreEntry.async('arraybuffer');
    const clientArtifacts = parseClientP12(clientP12Buffer, preferenceData.clientPassword);
    const caCertPem = parseTruststoreP12(truststoreBuffer, preferenceData.caPassword);

    return {
        takDescription: preferenceData.description,
        ...connection,
        clientCertPem: clientArtifacts.clientCertPem,
        clientKeyPem: clientArtifacts.clientKeyPem,
        caCertPem,
        clientP12Name: clientP12Entries[0].name.split('/').pop(),
        truststoreP12Name: truststoreEntry.name.split('/').pop(),
    };
}

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

function LabeledSelect({ label, name, value, onChange, options }) {
    return (
        <Grid item xs={12} sm={6}>
            <TextField
                select
                label={label}
                name={name}
                value={value ?? ''}
                onChange={onChange}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
            >
                {options.map((option) => (
                    <MenuItem key={`${option.label}-${option.value}`} value={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
            </TextField>
        </Grid>
    );
}

export default function TAKInputForm() {
    const { getServerHost } = useContext(CommsContext);
    const serverHost = useMemo(() => getServerHost(), [getServerHost]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [importing, setImporting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedFileName, setSelectedFileName] = useState('');
    const [importPreview, setImportPreview] = useState(null);
    const [isAdvanced, setIsAdvanced] = useState(false);
    const [takStatus, setTakStatus] = useState({
        connected: false,
        connecting: false,
        enabled: false,
        configured: false,
        packageImported: false,
        certExists: false,
        keyExists: false,
        caExists: false,
        message: '',
        reconnecting: false,
        reconnectGivenUp: false,
        reconnectAttempts: 0,
        reconnectTotalAttempts: 0,
        reconnectTotalSuccesses: 0,
        reconnectLastReason: '',
        timeSinceDisconnectMs: 0,
        nextReconnectInMs: 0,
    });
    const [takConfig, setTakConfig] = useState({
        takEnabled: false,
        takSSL: true,
        takVerifyCert: true,
        takUseClientCert: true,
        takServer: '',
        takTLSServerName: '',
        takPort: 8089,
        takCallsign: 'HaptiCap',
        takUID: '',
        takTypePreset: TAK_TYPE_PRESET_DEFAULT,
        takType: 'a-f-G-U-C',
        takDescription: '',
        takCACertPath: '/certs/tak_ca.crt',
        takClientCertPath: '/certs/tak_client.crt',
        takClientKeyPath: '/certs/tak_client.key',
        takClientP12Path: '/certs/tak_client.p12',
        takTruststoreP12Path: '/certs/truststore-root.p12',
        takReconnectEnabled: true,
        takReconnectOnWifiReconnect: true,
        takReconnectInitialDelayMs: 5000,
        takReconnectMaxDelayMs: 300000,
        takReconnectBackoffMultiplier: 1.5,
        takReconnectMaxDurationMs: 1800000,
    });

    function setMessage({ err = '', ok = '' }) {
        setError(err);
        setSuccess(ok);
    }

    async function loadAll() {
        try {
            const [cfgRes, statusRes] = await Promise.all([
                axios.get(`${serverHost}/tak/config`),
                axios.get(`${serverHost}/tak/status`),
            ]);
            setTakConfig((prev) => {
                const merged = { ...prev, ...cfgRes.data };
                const presetFromConfig = TAK_TYPE_PRESETS.some((item) => item.value === merged.takTypePreset)
                    ? merged.takTypePreset
                    : resolvePresetFromCotType(merged.takType);
                return {
                    ...merged,
                    takTypePreset: presetFromConfig,
                };
            });
            setTakStatus(statusRes.data || {});
            setMessage({});
        } catch (requestError) {
            setMessage({ err: requestError.response?.data?.message || 'Failed to load TAK state' });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadAll();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!takStatus.connecting) {
            return undefined;
        }

        const timerId = setInterval(() => {
            loadAll();
        }, 1500);

        return () => clearInterval(timerId);
    }, [takStatus.connecting]); // eslint-disable-line react-hooks/exhaustive-deps

    function handleInputChange(event) {
        const { name, value } = event.target;
        if (name === 'takTypePreset') {
            setTakConfig((prev) => ({
                ...prev,
                takTypePreset: value,
                takType: resolveCotTypeFromPreset(value),
            }));
            return;
        }
        setTakConfig((prev) => ({ ...prev, [name]: value }));
    }

    function handleCheckChange(event) {
        const { name, checked } = event.target;
        setTakConfig((prev) => ({ ...prev, [name]: checked }));
    }

    function sanitizeConfigForSave(cfg) {
        const normalizedPreset = TAK_TYPE_PRESETS.some((item) => item.value === cfg.takTypePreset)
            ? cfg.takTypePreset
            : TAK_TYPE_PRESET_DEFAULT;
        return {
            ...cfg,
            takServer: String(cfg.takServer || '').trim().replace(/^https?:\/\//i, '').replace(/\/+$/g, ''),
            takTLSServerName: String(cfg.takTLSServerName || '').trim().replace(/^https?:\/\//i, '').replace(/\/+$/g, ''),
            takPort: Number(cfg.takPort) || 8089,
            takTypePreset: normalizedPreset,
            takType: resolveCotTypeFromPreset(normalizedPreset),
            takReconnectInitialDelayMs: Math.max(1000, Number(cfg.takReconnectInitialDelayMs) || 5000),
            takReconnectMaxDelayMs: Math.max(Number(cfg.takReconnectInitialDelayMs) || 5000, Number(cfg.takReconnectMaxDelayMs) || 300000),
            takReconnectBackoffMultiplier: Math.max(1.1, parseFloat(cfg.takReconnectBackoffMultiplier) || 1.5),
            takReconnectMaxDurationMs: Math.max(0, Number(cfg.takReconnectMaxDurationMs) || 1800000),
        };
    }

    async function saveConfig() {
        setSaving(true);
        try {
            const payload = sanitizeConfigForSave(takConfig);
            await axios.post(`${serverHost}/tak/config`, payload, {
                headers: { 'Content-Type': 'application/json' },
            });
            setTakConfig((prev) => ({ ...prev, ...payload }));
            setMessage({ ok: 'TAK settings saved' });
            await loadAll();
        } catch (requestError) {
            setMessage({ err: requestError.response?.data?.message || 'Failed to save TAK settings' });
        } finally {
            setSaving(false);
        }
    }

    async function postSimple(endpoint, okMessage) {
        try {
            const response = await axios.post(`${serverHost}${endpoint}`, null, {
                headers: { 'Content-Type': 'application/json' },
            });
            setMessage({ ok: response.data?.message || okMessage });
            await loadAll();
        } catch (requestError) {
            setMessage({ err: requestError.response?.data?.message || 'Request failed' });
        }
    }

    async function handlePackageSelection(event) {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        setImporting(true);
        setSelectedFileName(file.name);
        setImportPreview(null);

        try {
            const parsedPackage = await parseTakPackage(file);
            const payload = {
                ...parsedPackage,
                takEnabled: takConfig.takEnabled,
                takVerifyCert: takConfig.takVerifyCert,
                takUseClientCert: takConfig.takUseClientCert,
                takCallsign: takConfig.takCallsign,
                takUID: takConfig.takUID,
            };

            await axios.post(`${serverHost}/tak/import-package-data`, payload, {
                headers: { 'Content-Type': 'application/json' },
            });

            setImportPreview({
                takServer: parsedPackage.takServer,
                takPort: parsedPackage.takPort,
                takSSL: parsedPackage.takSSL,
                takDescription: parsedPackage.takDescription,
                clientP12Name: parsedPackage.clientP12Name,
                truststoreP12Name: parsedPackage.truststoreP12Name,
            });
            setTakConfig((prev) => ({
                ...prev,
                takServer: parsedPackage.takServer,
                takTLSServerName: parsedPackage.takServer,
                takPort: parsedPackage.takPort,
                takSSL: parsedPackage.takSSL,
                takDescription: parsedPackage.takDescription,
            }));
            setMessage({ ok: 'TAK package imported successfully' });
            await loadAll();
        } catch (requestError) {
            setMessage({ err: requestError.response?.data?.message || requestError.message || 'Failed to import TAK package' });
        } finally {
            setImporting(false);
            event.target.value = '';
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
            <Stack direction="row" spacing={1.5} sx={{ mb: 1, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>TAK Settings</Typography>
                <Button 
                    variant={isAdvanced ? 'contained' : 'outlined'} 
                    size="small"
                    onClick={() => setIsAdvanced(!isAdvanced)}
                >
                    {isAdvanced ? 'Basic' : 'Advanced'}
                </Button>
            </Stack>

            <Typography variant="body2" sx={{ mb: 2 }}>
                Upload the TAK server enrollment package. The browser will unpack the nested archive, read the connection XML,
                convert the PKCS#12 files to PEM, and send the resulting TAK settings and certificate material to the device.
            </Typography>

            <Stack direction="row" spacing={1.5} sx={{ mb: 2, flexWrap: 'wrap' }}>
                <Button variant="contained" component="label" disabled={importing}>
                    {importing ? 'Importing package...' : 'Choose TAK Package'}
                    <input type="file" hidden accept=".zip,application/zip" onChange={handlePackageSelection} />
                </Button>
                <Button
                    variant="outlined"
                    type="button"
                    onClick={() => postSimple('/tak/connect', 'TAK connection requested')}
                    disabled={takStatus.connecting || takStatus.connected}
                >
                    {takStatus.connecting ? 'Connecting...' : 'Connect'}
                </Button>
                <Button variant="outlined" type="button" onClick={() => postSimple('/tak/disconnect', 'TAK disconnected')}>Disconnect</Button>
                {isAdvanced && <Button variant="text" type="button" onClick={loadAll}>Refresh Status</Button>}
            </Stack>

            {selectedFileName && (
                <Typography variant="body2" sx={{ mb: 2 }}>
                    Selected package: {selectedFileName}
                </Typography>
            )}

            {importPreview && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    Imported {importPreview.clientP12Name} and {importPreview.truststoreP12Name} for {importPreview.takServer}:{importPreview.takPort}
                </Alert>
            )}

            <Typography variant="subtitle2" sx={{ mb: isAdvanced ? 1 : 2 }}>
                Connection Status: {takStatus.connected ? 'Connected' : takStatus.connecting ? 'Connecting...' : 'Disconnected'}
            </Typography>

            {isAdvanced && (
                <>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Status: {takStatus.connected ? 'Connected' : takStatus.connecting ? 'Connecting...' : 'Disconnected'} | Configured: {takStatus.configured ? 'Yes' : 'No'} | Package Imported: {takStatus.packageImported ? 'Yes' : 'No'}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                        Certs: client {takStatus.certExists ? 'Yes' : 'No'} | key {takStatus.keyExists ? 'Yes' : 'No'} | CA {takStatus.caExists ? 'Yes' : 'No'}
                    </Typography>
                </>
            )}

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <LabeledCheck label="TAK Enabled" name="takEnabled" checked={takConfig.takEnabled} onChange={handleCheckChange} />
                <LabeledField label="TAK Server" name="takServer" value={takConfig.takServer} onChange={handleInputChange} />
                <LabeledSelect
                    label="TAK Unit Type"
                    name="takTypePreset"
                    value={takConfig.takTypePreset}
                    onChange={handleInputChange}
                    options={TAK_TYPE_PRESETS}
                />
                
                {isAdvanced && (
                    <>
                        <LabeledCheck label="Use SSL/TLS" name="takSSL" checked={takConfig.takSSL} onChange={handleCheckChange} />
                        <LabeledCheck label="Verify Certificate" name="takVerifyCert" checked={takConfig.takVerifyCert} onChange={handleCheckChange} />
                        <LabeledCheck label="Use Client Certificate" name="takUseClientCert" checked={takConfig.takUseClientCert} onChange={handleCheckChange} />
                        <LabeledField label="TLS Server Name (CN/SAN)" name="takTLSServerName" value={takConfig.takTLSServerName} onChange={handleInputChange} />
                        <LabeledField label="TAK Port" name="takPort" value={takConfig.takPort} onChange={handleInputChange} type="number" />
                        <LabeledField label="Callsign" name="takCallsign" value={takConfig.takCallsign} onChange={handleInputChange} />
                        <LabeledField label="UID" name="takUID" value={takConfig.takUID} onChange={handleInputChange} />
                        <LabeledField label="Description" name="takDescription" value={takConfig.takDescription} onChange={handleInputChange} />
                        <LabeledField label="CA Path" name="takCACertPath" value={takConfig.takCACertPath} onChange={handleInputChange} />
                        <LabeledField label="Client Cert Path" name="takClientCertPath" value={takConfig.takClientCertPath} onChange={handleInputChange} />
                        <LabeledField label="Client Key Path" name="takClientKeyPath" value={takConfig.takClientKeyPath} onChange={handleInputChange} />
                        <LabeledField label="Client P12 Path" name="takClientP12Path" value={takConfig.takClientP12Path} onChange={handleInputChange} />
                        <LabeledField label="Truststore P12 Path" name="takTruststoreP12Path" value={takConfig.takTruststoreP12Path} onChange={handleInputChange} />
                    </>
                )}
            </Grid>

            {isAdvanced && (
                <>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Reconnection Settings</Typography>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <LabeledCheck label="Auto Reconnect Enabled" name="takReconnectEnabled" checked={takConfig.takReconnectEnabled} onChange={handleCheckChange} />
                        <LabeledCheck label="Reconnect on WiFi Reconnect" name="takReconnectOnWifiReconnect" checked={takConfig.takReconnectOnWifiReconnect} onChange={handleCheckChange} />
                        <LabeledField label="Initial Delay (ms)" name="takReconnectInitialDelayMs" value={takConfig.takReconnectInitialDelayMs} onChange={handleInputChange} type="number" />
                        <LabeledField label="Max Delay (ms)" name="takReconnectMaxDelayMs" value={takConfig.takReconnectMaxDelayMs} onChange={handleInputChange} type="number" />
                        <LabeledField label="Backoff Multiplier" name="takReconnectBackoffMultiplier" value={takConfig.takReconnectBackoffMultiplier} onChange={handleInputChange} type="number" />
                        <LabeledField label="Max Reconnect Duration (ms, 0=unlimited)" name="takReconnectMaxDurationMs" value={takConfig.takReconnectMaxDurationMs} onChange={handleInputChange} type="number" />
                    </Grid>

                    <Typography variant="h6" gutterBottom sx={{ mt: 1 }}>Reconnection Metrics</Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Status: {takStatus.reconnecting ? 'Reconnecting...' : takStatus.reconnectGivenUp ? 'Gave up' : 'Idle'}
                        {takStatus.reconnectGivenUp && ` \u2014 ${takStatus.reconnectLastReason}`}
                    </Typography>
                    {takStatus.timeSinceDisconnectMs > 0 && (
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                            Time since disconnect: {Math.round(takStatus.timeSinceDisconnectMs / 1000)}s
                            {takStatus.reconnectAttempts > 0 && ` | Attempts this cycle: ${takStatus.reconnectAttempts}`}
                            {takStatus.nextReconnectInMs > 0 && ` | Next attempt in: ${Math.round(takStatus.nextReconnectInMs / 1000)}s`}
                        </Typography>
                    )}
                    {takStatus.reconnectLastReason && !takStatus.reconnectGivenUp && (
                        <Typography variant="body2" sx={{ mb: 0.5 }}>Last failure: {takStatus.reconnectLastReason}</Typography>
                    )}
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Lifetime: {takStatus.reconnectTotalAttempts} attempts | {takStatus.reconnectTotalSuccesses} successes
                    </Typography>
                </>
            )}

            <Stack direction="row" spacing={1.5} sx={{ mb: 2, flexWrap: 'wrap' }}>
                <Button variant="contained" type="button" onClick={saveConfig} disabled={saving}>
                    {saving ? 'Saving...' : 'Save TAK Settings'}
                </Button>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 1 }}>{success}</Alert>}
            {!!takStatus.message && <Alert severity="info">{takStatus.message}</Alert>}
        </Box>
    );
}
