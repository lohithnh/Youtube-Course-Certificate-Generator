
const apiKey = " " // Insert Youtube data API Key here
async function getYouTubeVideoInfo(videoId) {
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            const video = data.items[0];
            const title = video.snippet.title;
            const channelName = video.snippet.channelTitle;

            return { title, channelName };
        } else {
            throw new Error('Video not found');
        }
    } catch (error) {
        console.error('Error fetching video info:', error);
        return null;
    }
}
// Function to fetch playlist information from YouTube
async function getYouTubePlaylistInfo(playlistId) {
    const apiUrl = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            const playlist = data.items[0];
            const title = playlist.snippet.title;
            const channelName = playlist.snippet.channelTitle;

            return { title, channelName };
        } else {
            throw new Error('Playlist not found');
        }
    } catch (error) {
        console.error('Error fetching playlist info:', error);
        return null;
    }
}

document.getElementById('generateCertificate').addEventListener('click', async () => {
    // generatePDF("Sharan Hegade","Certificate Generator Website in JavaScript","Padhega India","Youtube Certificate Generator")
    const name = document.getElementById('name').value.trim();
    const vidLink = document.getElementById('vidLink').value.trim();
    const playLink = document.getElementById('playLink').value.trim();
    const projectTitle = document.getElementById('projectTitle').value.trim();
    let type;

    if (document.getElementById('videoType').checked) {
        type = 'video';
    } else if (document.getElementById('playlistType').checked) {
        type = 'playlist';
    }

    let ytTitle = '';
    let ytChannel = '';

    // Determine whether to fetch video or playlist info based on user selection
    if (type === 'video') {
        const videoId = vidLink.split('v=')[1].split('&')[0];
        const videoInfo = await getYouTubeVideoInfo(videoId);

        if (videoInfo) {
            ytTitle = videoInfo.title;
            ytChannel = videoInfo.channelName;
        }
    } else if (type === 'playlist') {
        const playlistId = playLink.split('list=')[1];
        const playlistInfo = await getYouTubePlaylistInfo(playlistId);

        if (playlistInfo) {
            ytTitle = playlistInfo.title;
            ytChannel = playlistInfo.channelName;
        }
    }
    generatePDF(name, ytTitle, ytChannel, projectTitle);
});

// Function to generate a random certificate number
function generateCertificateNumber() {
    const randomNumber = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit random number
    return randomNumber;
}

const generatePDF = async (name , ytTitle , ytChannel , projName) =>{

    const maxTitleLength = 44;

    const certNumber = generateCertificateNumber().toString();

    const{PDFDocument , rgb} = PDFLib;
    const exBytes = await fetch("./cert1.pdf").then((res) =>{
        return res.arrayBuffer();
    });

    const priFont = await fetch("./AlexBrush-Regular.ttf").then(res =>{
        return res.arrayBuffer();
    });

    const secFont = await fetch("./RobotoSlab.ttf").then(res =>{
        return res.arrayBuffer();
    });

    const pdfDoc = await PDFDocument.load(exBytes)

    pdfDoc.registerFontkit(fontkit);
    const mainFont = await pdfDoc.embedFont(priFont);
    const subFont = await pdfDoc.embedFont(secFont);

    const pages = pdfDoc.getPages();
    const firstPg = pages[0]

    if(ytTitle.length > maxTitleLength){
        if(ytChannel.length < 10){
            ytTitle = ytTitle.substring(0, maxTitleLength) + '\n' + '\t\t\t\t\t' + ytTitle.substring(maxTitleLength);
        }
        else{
            ytTitle = ytTitle.substring(0, maxTitleLength) + '\n' + '\t\t\t\t\t\t\t\t\t\t\t' + ytTitle.substring(maxTitleLength);
        }

    }
    firstPg.drawText(name, {
        x:315,
        y:315,
        size:60,
        font:mainFont
    })
    firstPg.drawText(ytTitle, {
        x:290,
        y:250,
        size:21,
        font:subFont
    })
    firstPg.drawText(ytChannel, {
        x:290,
        y:219,
        size:21,
        font:subFont
    })
    firstPg.drawText(projName, {
        x:290,
        y:185,
        size:21,
        font:subFont
    })
    firstPg.drawText(certNumber, {
        x:380,
        y:115,
        size:21,
        font:subFont
    })
    const uri = await pdfDoc.saveAsBase64({dataUri: true })

    const byteCharacters = atob(uri.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    // Open the PDF in a new window/tab
    window.open(url, '_blank');

    
    // document.querySelector("#mypdf").src = uri;
};

