const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Try to fetch from Supabase if available
    if (supabase) {
      const { data: liveTestimonials, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('approved', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && liveTestimonials && liveTestimonials.length > 0) {
        // Transform to expected format
        const formattedTestimonials = liveTestimonials.map((testimonial, index) => ({
          id: testimonial.id || index + 1,
          name: testimonial.name || 'Anoniem',
          avatar: testimonial.avatar_url || `https://images.pexels.com/photos/${1239291 + index}/pexels-photo-${1239291 + index}.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2`,
          text: testimonial.text || testimonial.review_text,
          rating: testimonial.rating || 5,
          location: testimonial.location,
          verified: testimonial.verified || true,
          sentiment: testimonial.sentiment || 'positive',
          category: testimonial.category || 'experience'
        }));

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(formattedTestimonials)
        };
      }
    }

    // Fallback to enhanced static testimonials with dynamic elements
    const enhancedTestimonials = [
      {
        id: 1,
        name: 'Jordi',
        avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        text: 'Alsof deze AI recht door mij heen keek, superwaardevol!',
        rating: 5,
        location: 'Amsterdam',
        verified: true,
        sentiment: 'positive',
        category: 'results'
      },
      {
        id: 2,
        name: 'Emma',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        text: 'Verbazingwekkend nauwkeurig! Ik begrijp mezelf ineens veel beter.',
        rating: 5,
        location: 'Utrecht',
        verified: true,
        sentiment: 'positive',
        category: 'style'
      },
      {
        id: 3,
        name: 'Lisa',
        avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        text: 'Nova begrijpt precies wie ik ben. Geweldig!',
        rating: 5,
        location: 'Rotterdam',
        verified: true,
        sentiment: 'positive',
        category: 'experience'
      },
      {
        id: 4,
        name: 'Thomas',
        avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        text: 'Voor het eerst weet ik écht wat bij mij past!',
        rating: 5,
        location: 'Den Haag',
        verified: true,
        sentiment: 'positive',
        category: 'style'
      },
      {
        id: 5,
        name: 'Sophie',
        avatar: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        text: 'De inzichten zijn zo accuraat, ik ben onder de indruk!',
        rating: 5,
        location: 'Eindhoven',
        verified: true,
        sentiment: 'positive',
        category: 'results'
      },
      // Add some fresh testimonials with different sentiments
      {
        id: 6,
        name: 'Mike',
        avatar: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        text: 'Goed advies, maar soms net niet helemaal mijn smaak.',
        rating: 4,
        location: 'Groningen',
        verified: true,
        sentiment: 'neutral',
        category: 'service'
      }
    ];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(enhancedTestimonials)
    };

  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to fetch testimonials',
        message: error.message
      })
    };
  }
};