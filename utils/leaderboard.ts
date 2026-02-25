import redisClient from '../config/redis';

export async function setScore(roomID: string, userID: string, score: number) {
    await redisClient.zAdd(`pk_battle:${roomID}`, { score, value: userID });
}

export async function topScores(roomID: string, limit: number = 10) {
    return await redisClient.zRevRangeWithScores(`pk_battle:${roomID}`, 0, limit - 1);
}
