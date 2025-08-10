
// GIF files required for gesture display:
// gifs/yes.gif
// gifs/no.gif (used for all gestures meaning 'NO', e.g., Fist, Thumbs Down)
// gifs/hello.gif
// gifs/iloveyou.gif
// gifs/peace.gif
// gifs/ok.gif
// gifs/fist.gif (optional, but 'no.gif' is used for 'NO')
// gifs/highfive.gif
// gifs/rock.gif
// gifs/point.gif
// gifs/three.gif
// gifs/four.gif
// gifs/callme.gif
// gifs/gun.gif
// gifs/victory.gif
// gifs/thumbsdown.gif (optional, but 'no.gif' is used for 'NO')

const videoElement = document.getElementById('webcam');
const outputElement = document.getElementById('output');
const gifElement = document.getElementById('sign-gif'); // Add this line

let lastGesture = null;
let speakTimeout = null;

function detectGesture(landmarks) {
    // Get y-coordinates for tips and MCPs (base joints) for better detection
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];
    const indexMCP = landmarks[5];
    const middleMCP = landmarks[9];
    const ringMCP = landmarks[13];
    const pinkyMCP = landmarks[17];
    const wrist = landmarks[0];

    // Thumbs Up: Thumb tip above index/middle MCP, other fingers curled (tips below MCPs)
    if (
        thumbTip.y < indexMCP.y &&
        indexTip.y > indexMCP.y &&
        middleTip.y > middleMCP.y &&
        ringTip.y > ringMCP.y &&
        pinkyTip.y > pinkyMCP.y
    ) {
        return "Thumbs Up 👍 = YES";
    }
    // Hello: All fingers extended (tips above MCPs)
    if (
        thumbTip.y < wrist.y &&
        indexTip.y < indexMCP.y &&
        middleTip.y < middleMCP.y &&
        ringTip.y < ringMCP.y &&
        pinkyTip.y < pinkyMCP.y
    ) {
        return "Hello 👋";
    }
    // I Love You: Thumb, index, pinky up; middle/ring down
    // Thumb must be to the side (x distance from index), and not curled in
    if (
        indexTip.y < indexMCP.y &&
        middleTip.y > middleMCP.y &&
        ringTip.y > ringMCP.y &&
        pinkyTip.y < pinkyMCP.y &&
        Math.abs(thumbTip.x - indexTip.x) > 0.10 && // thumb to the side
        thumbTip.y < indexMCP.y // thumb not curled in
    ) {
        return "I Love You 🤟";
    }
    // Peace: Index and middle up, others down
    if (
        indexTip.y < indexMCP.y &&
        middleTip.y < middleMCP.y &&
        ringTip.y > ringMCP.y &&
        pinkyTip.y > pinkyMCP.y &&
        thumbTip.y > indexMCP.y
    ) {
        return "Peace ✌️";
    }
    // OK: Index tip and thumb tip close, others extended
    if (
        Math.abs(indexTip.x - thumbTip.x) < 0.05 &&
        Math.abs(indexTip.y - thumbTip.y) < 0.05 &&
        middleTip.y < middleMCP.y &&
        ringTip.y < ringMCP.y &&
        pinkyTip.y < pinkyMCP.y
    ) {
        return "OK 👌";
    }
    // Fist: All tips below MCPs
    if (
        thumbTip.y > indexMCP.y &&
        indexTip.y > indexMCP.y &&
        middleTip.y > middleMCP.y &&
        ringTip.y > ringMCP.y &&
        pinkyTip.y > pinkyMCP.y
    ) {
        return "Fist ✊ = NO";
    }
    // High Five: All fingers extended, spread apart
    if (
        thumbTip.y < wrist.y &&
        indexTip.y < indexMCP.y &&
        middleTip.y < middleMCP.y &&
        ringTip.y < ringMCP.y &&
        pinkyTip.y < pinkyMCP.y &&
        Math.abs(indexTip.x - middleTip.x) > 0.05 &&
        Math.abs(middleTip.x - ringTip.x) > 0.05
    ) {
        return "High Five 🖐️";
    }
    // Rock: Index and pinky up, middle/ring down, thumb curled in (close to palm, not to the side or up)
    if (
        indexTip.y < indexMCP.y &&
        middleTip.y > middleMCP.y &&
        ringTip.y > ringMCP.y &&
        pinkyTip.y < pinkyMCP.y &&
        Math.abs(thumbTip.x - indexTip.x) < 0.08 && // thumb not to the side
        thumbTip.y > wrist.y // thumb curled in
    ) {
        return "Rock 🤘";
    }
    // Point: Only index up
    if (
        indexTip.y < indexMCP.y &&
        middleTip.y > middleMCP.y &&
        ringTip.y > ringMCP.y &&
        pinkyTip.y > pinkyMCP.y &&
        thumbTip.y > indexMCP.y
    ) {
        return "Point 👉";
    }
    // Three: Index, middle, ring up; pinky and thumb down
    if (
        indexTip.y < indexMCP.y &&
        middleTip.y < middleMCP.y &&
        ringTip.y < ringMCP.y &&
        pinkyTip.y > pinkyMCP.y &&
        thumbTip.y > indexMCP.y
    ) {
        return "Three 3️⃣";
    }
    // Four: All but thumb up
    if (
        indexTip.y < indexMCP.y &&
        middleTip.y < middleMCP.y &&
        ringTip.y < ringMCP.y &&
        pinkyTip.y < pinkyMCP.y &&
        thumbTip.y > indexMCP.y
    ) {
        return "Four 4️⃣";
    }
    // Call Me: Thumb and pinky up, others down
    if (
        thumbTip.y < wrist.y &&
        indexTip.y > indexMCP.y &&
        middleTip.y > middleMCP.y &&
        ringTip.y > ringMCP.y &&
        pinkyTip.y < pinkyMCP.y
    ) {
        return "Call Me 🤙";
    }
    // Gun: Thumb and index up, others down
    if (
        thumbTip.y < wrist.y &&
        indexTip.y < indexMCP.y &&
        middleTip.y > middleMCP.y &&
        ringTip.y > ringMCP.y &&
        pinkyTip.y > pinkyMCP.y
    ) {
        return "Gun 🤠";
    }
    // Thumbs Down: Thumb tip below index MCP, others curled
    if (
        thumbTip.y > indexMCP.y &&
        indexTip.y > indexMCP.y &&
        middleTip.y > middleMCP.y &&
        ringTip.y > ringMCP.y &&
        pinkyTip.y > pinkyMCP.y
    ) {
        return "Thumbs Down 👎 = NO";
    }
    // Victory: Index and middle up, spread apart
    if (
        indexTip.y < indexMCP.y &&
        middleTip.y < middleMCP.y &&
        Math.abs(indexTip.x - middleTip.x) > 0.07 &&
        ringTip.y > ringMCP.y &&
        pinkyTip.y > pinkyMCP.y
    ) {
        return "Victory ✌️";
    }
    return null;
}

function getGifFileName(signLabel) {
    // Map spoken label to gif filename (lowercase, no spaces, no special chars)
    let key = signLabel.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
    // Map some common cases for clarity
    // All gestures meaning 'NO' (e.g., 'no', 'fist', 'thumbsdown') use 'no.gif'
    if (['no', 'fist', 'thumbsdown'].includes(key)) return 'no.gif';
    const map = {
        yes: 'yes.gif',
        hello: 'hello.gif',
        iloveyou: 'iloveyou.gif',
        peace: 'peace.gif',
        ok: 'ok.gif',
        highfive: 'highfive.gif',
        rock: 'rock.gif',
        point: 'point.gif',
        three: 'three.gif',
        four: 'four.gif',
        callme: 'callme.gif',
        gun: 'gun.gif',
        victory: 'victory.gif'
    };
    return map[key] || null;
}

function onResults(results) {
    let gesture = null;
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        // Defensive: check if landmarks are valid and have at least 21 points
        const landmarks = results.multiHandLandmarks[0];
        if (Array.isArray(landmarks) && landmarks.length >= 21) {
            gesture = detectGesture(landmarks);
        } else {
            gesture = null;
        }
        // Extract sign name for label
        let signLabel = gesture;
        if (gesture) {
            if (gesture.includes('=')) {
                signLabel = gesture.split('=')[1].trim();
            } else {
                signLabel = gesture.replace(/[\u{1F600}-\u{1F6FF}\u{1F300}-\u{1F5FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u2600-\u26FF\u2700-\u27BF]/gu, '').trim();
            }
        }
        outputElement.textContent = signLabel || "No gesture detected...";
        // Set GIF
        if (signLabel) {
            const gifFile = getGifFileName(signLabel);
            if (gifFile) {
                // Force reload by changing src even if same file
                if (gifElement.src.indexOf(gifFile) === -1) {
                    gifElement.src = `gifs/${gifFile}`;
                }
                gifElement.style.display = 'inline-block';
                gifElement.alt = signLabel + " sign";
            } else {
                gifElement.src = "";
                gifElement.style.display = 'none';
                gifElement.alt = "";
            }
        } else {
            gifElement.src = "";
            gifElement.style.display = 'none';
            gifElement.alt = "";
        }
    } else {
        outputElement.textContent = "No hand detected...";
        gifElement.src = "";
        gifElement.style.display = 'none';
        gifElement.alt = "";
    }
    // Only speak if gesture changed and is not null
    if (gesture && gesture !== lastGesture) {
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
        let signName = gesture;
        if (gesture.includes('=')) {
            signName = gesture.split('=')[1].trim();
        } else {
            signName = gesture.replace(/[\u{1F600}-\u{1F6FF}\u{1F300}-\u{1F5FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u2600-\u26FF\u2700-\u27BF]/gu, '').trim();
        }
        clearTimeout(speakTimeout);
        speakTimeout = setTimeout(() => {
            let utterance = new SpeechSynthesisUtterance(signName);
            speechSynthesis.speak(utterance);
        }, 300);
        lastGesture = gesture;
    } else if (!gesture && lastGesture) {
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
        lastGesture = null;
    }
}

const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});
hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
});
hands.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({ image: videoElement });
    },
    width: 640,
    height: 480
});
camera.start();
camera.start();
