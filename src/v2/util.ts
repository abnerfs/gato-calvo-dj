import { User } from "discord.js";

export const userToMention = (user: User) => `<@${user.id}>`
