import { spawn } from "child_process";

export const youtubeDlStream = (url: string) => {
    const args = ["-x", "-f", "bestaudio", url, "-o", "-"];
    const youtubeDlProcess = spawn(process.env.YTDLP_PATH || "yt-dlp", args);
    youtubeDlProcess.stderr.on("data", (data) => {
        console.error(`Error in ytdl-p stream: ` + data.toString());
    });

    return youtubeDlProcess.stdout;
}
