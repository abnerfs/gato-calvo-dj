import { spawn } from "child_process";
import { COOKIES_PATH } from "./config";

export const youtubeDlStream = (url: string) => {
    const args = ["-x", "-f", "bestaudio", url, "-o", "-"];
    if(COOKIES_PATH)
        args.push("--cookies", '"' + COOKIES_PATH + '"');

    const youtubeDlProcess = spawn(process.env.YTDLP_PATH || "yt-dlp", args);
    youtubeDlProcess.stderr.on("data", (data) => {
        console.error(`Error in ytdl-p stream: ` + data.toString());
    });

    return youtubeDlProcess.stdout;
}
