const KEY_FILES = [
        'https://raw.githubusercontent.com/kado-kado/pgp/refs/heads/keys/keys/github/github.asc',
        'https://raw.githubusercontent.com/kado-kado/pgp/refs/heads/keys/keys/proton/proton.asc',
        'https://raw.githubusercontent.com/kado-kado/pgp/refs/heads/keys/keys/xrypton.56.ax/xrypton.asc'
    ];

async function init() {
    const app = document.getElementById('app');
    app.innerHTML = '';

    for (const path of KEY_FILES) {
        await createKeyCard(path);
    }
}

async function createKeyCard(filePath) {
    const app = document.getElementById('app');
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `Loading ${filePath}...`;
    app.appendChild(card);

    const parts = filePath.split('https://raw.githubusercontent.com/kado-kado/pgp/refs/heads/keys/keys/')[1]?.split('/') || [];
    const snsName = parts[1] || 'Unknown';

    try {
        const res = await fetch(`${filePath}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const text = await res.text();
        const key = await openpgp.readKey({ armoredKey: text.trim() });

        const primaryKey = key.keyPacket;
        const algo = primaryKey.getAlgorithmInfo();
        const algoName = algo.curve ? `${algo.algorithm} (${algo.curve})` : algo.algorithm;

        const isRevoked = await key.isRevoked();
        const expiration = await key.getExpirationTime();
        const now = new Date();
        const expired = expiration && expiration < now;

        const statusClass = (isRevoked || expired) ? 'status-error' : 'status-ok';
        const statusText = isRevoked ? 'REVOKED' : (expired ? 'EXPIRED' : 'OPERATIONAL');

        const fp = key.getFingerprint().toUpperCase().match(/.{1,4}/g).join(' ');

        const dateStr = (expiration instanceof Date) ? expiration.toISOString() : 'Never';

        card.innerHTML = `
            <div class="sns-name">
            ${snsName}
            <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
            <div class="meta">
                <div class="meta-item"><span class="label">Algorithm</span><span>${algoName}</span></div>
                <div class="meta-item"><span class="label">Expires</span><span>${dateStr}</span></div>
                <div class="fp">${fp}</div>
                <div class="file-path"><a href="${filePath}" target="_blank" rel="noopener noreferrer">file: ${snsName}</a></div>
            </div>`;
    } catch (e) {
        console.error(`Card Error (${snsName}):`, e);
        card.innerHTML = `
            <div class="sns-name">${snsName}</div>
            <div class="status-error">Parse Error</div>
            <div class="meta" style="font-size:0.7rem;">${e.message}</div>`;
    }
}

init();