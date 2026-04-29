const FINGERPRINT_FILES = [
        'keys/line/fingerprint.md'
    ];

async function loadMarkdown() {
    try {
        const res = await fetch(`${FINGERPRINT_FILES[0]}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const markdown = await res.text();
        document.getElementById('fingerprintContent').innerHTML = markdown;
    } catch (error) {
        console.error('Error loading fingerprint:', error);
    }
}

loadMarkdown();