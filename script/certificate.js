const CERTIFICATE_JSON = [
        'https://raw.githubusercontent.com/kado-kado/pgp/refs/heads/keys/keys/developer/certificate.json'
    ];

async function updateExpiryDisplay() {
    try {
        const cacheBuster = `?t=${new Date().getTime()}`;
        const response = await fetch(CERTIFICATE_JSON[0] + cacheBuster);

        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

        const certDataList = await response.json();
        const containerElement = document.getElementById('apple');

        if (!containerElement) return;

        const dataArray = Array.isArray(certDataList) ? certDataList : [certDataList];

        containerElement.innerHTML = dataArray.map(cert => {
            const expiryDate = new Date(cert.expires);
            const now = new Date();
            const diffTime = expiryDate - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let statusClass = 'status-active';
            let statusText = 'Active';

            if (diffDays <= 0) {
                statusClass = 'status-expired';
                statusText = 'Expired';
            } else if (diffDays <= 2) {
                statusClass = 'status-warning';
                statusText = 'Expiring Soon';
            }

            return `
                <div class="sns-name">
                    ${cert.name}
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
                <div class="meta">
                    <div class="meta-item"><span class="label">Expires</span><span>${cert.expires}</span></div>
                    <div class="meta-item"><span class="label">Days Left</span><span>${diffDays > 0 ? diffDays : 0} days</span></div>
                    <div class="fp">${cert.teamid}</div>
                </div>`;
        }).join('');
    } catch (err) {
        console.error('Failed to fetch expiry data:', err);
    }
}

updateExpiryDisplay();