import random
from textblob import TextBlob

class MoodAnalyzer:
    def __init__(self):
        self.mood_keywords = {
            'positive': ['happy', 'good', 'great', 'well', 'better', 'calm', 'relaxed'],
            'negative': ['sad', 'bad', 'stress', 'anxious', 'angry', 'tired', 'overwhelmed'],
            'diabetes_specific': ['sugar', 'glucose', 'insulin', 'burnout', 'needle', 'test']
        }
    
    def analyze_text(self, text):
        if not text or text.strip() == "":
            return {"mood_score": 0.5, "sentiment": "neutral", "confidence": 0.0}
        
        text_lower = text.lower()
        positive_words = sum(1 for word in self.mood_keywords['positive'] if word in text_lower)
        negative_words = sum(1 for word in self.mood_keywords['negative'] if word in text_lower)
        diabetes_words = sum(1 for word in self.mood_keywords['diabetes_specific'] if word in text_lower)
        
        total_words = max(positive_words + negative_words, 1)
        mood_score = positive_words / total_words
        
        try:
            blob = TextBlob(text)
            polarity = blob.sentiment.polarity
            blended_score = (mood_score + (polarity + 1) / 2) / 2
        except:
            blended_score = mood_score
        
        if blended_score > 0.6:
            sentiment = "positive"
        elif blended_score < 0.4:
            sentiment = "negative"
        else:
            sentiment = "neutral"
        
        return {
            "mood_score": round(blended_score, 2),
            "sentiment": sentiment,
            "diabetes_related": diabetes_words > 0,
            "confidence": abs(blended_score - 0.5) * 2
        }
    
    def predict_glucose_impact(self, mood_data, current_glucose=100):
        mood_score = mood_data['mood_score']
        sentiment = mood_data['sentiment']
        
        if sentiment == "negative":
            impact = (1 - mood_score) * 30
            predicted_glucose = min(current_glucose + impact, 200)
        elif sentiment == "positive":
            impact = mood_score * 15
            predicted_glucose = max(current_glucose - impact, 70)
        else:
            predicted_glucose = current_glucose
        
        return {
            "predicted_glucose": round(predicted_glucose),
            "impact_direction": "increase" if predicted_glucose > current_glucose else "decrease",
            "impact_magnitude": abs(predicted_glucose - current_glucose)
        }