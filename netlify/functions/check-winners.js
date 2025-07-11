// netlify/functions/check-winners.js
// 당첨자 수를 체크하는 Netlify Functions

exports.handler = async (event, context) => {
  // CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // OPTIONS 요청 처리 (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // GET 요청만 허용
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    // Netlify Forms API에서 당첨자 데이터 가져오기
    const response = await fetch(`https://api.netlify.com/api/v1/sites/${process.env.NETLIFY_SITE_ID}/submissions`, {
      headers: {
        'Authorization': `Bearer ${process.env.NETLIFY_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Netlify API 오류: ${response.status}`);
    }

    const submissions = await response.json();
    
    // heendy-survey 폼의 당첨자만 필터링
    const surveySubmissions = submissions.filter(submission => 
      submission.form_name === 'heendy-survey' && 
      submission.data && 
      submission.data.isWinner === '당첨'
    );

    const winnerCount = surveySubmissions.length;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        winnerCount,
        totalSubmissions: submissions.filter(s => s.form_name === 'heendy-survey').length,
        remainingSlots: Math.max(0, 50 - winnerCount),
        isLimitReached: winnerCount >= 50,
      }),
    };

  } catch (error) {
    console.error('당첨자 확인 중 오류:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: '당첨자 수 확인 실패',
        winnerCount: 0, // 오류시 기본값
        message: error.message,
      }),
    };
  }
};
