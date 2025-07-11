const fs = require('fs').promises;
const path = require('path');

exports.handler = async (event, context) => {
    // CORS 헤더
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const data = JSON.parse(event.body);
        
        // 현재 시간과 참여자 정보
        const timestamp = new Date().toISOString();
        const participant = {
            timestamp,
            employeeId: data.employeeId,
            userName: data.userName,
            score: data.score,
            answers: data.answers
        };

        // Netlify의 환경 변수나 간단한 카운터 사용
        // 실제로는 외부 DB 사용 권장 (Airtable, Supabase 등)
        
        // 간단한 선착순 로직: 타임스탬프 기준
        const submissionHour = new Date().getHours();
        const submissionMinute = new Date().getMinutes();
        
        // 오전 9시~10시 사이 제출을 선착순으로 간주 (예시)
        const isWinner = (submissionHour === 9) || 
                        (submissionHour === 10 && submissionMinute <= 30);

        // 실제 환경에서는 Database 연동
        const result = {
            ...participant,
            isWinner,
            participantNumber: Math.floor(Math.random() * 100) + 1 // 실제로는 DB에서 가져옴
        };

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                isWinner: result.isWinner,
                participantNumber: result.participantNumber,
                message: '제출이 완료되었습니다!'
            })
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                success: false, 
                error: error.message 
            })
        };
    }
};