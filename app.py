from flask import Flask, render_template, request, jsonify, session
import json
from datetime import datetime, timedelta
from ml.sentiment_analysis import MoodAnalyzer
from ml.model import DiabetesAICompanion
import pandas as pd
import numpy as np
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'diamind-pro-secret-2024')
app.permanent_session_lifetime = timedelta(days=30)

mood_analyzer = MoodAnalyzer()
ai_companion = DiabetesAICompanion()

# In production, use a database
class UserData:
    def __init__(self):
        self.mood_entries = []
        self.glucose_readings = []
        self.chat_history = []
        self.insights = []
        
    def get_weekly_trends(self):
        # Generate insights from data
        if len(self.mood_entries) < 3:
            return {"message": "Keep logging data to see trends"}
            
        df = pd.DataFrame(self.mood_entries)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        insights = {
            "avg_mood": np.mean([e['mood_data']['mood_score'] for e in self.mood_entries]),
            "stress_days": len([e for e in self.mood_entries if e['mood_data']['sentiment'] == 'negative']),
            "correlation": "Analyzing patterns...",
            "recommendations": []
        }
        
        return insights

user_data = UserData()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    trends = user_data.get_weekly_trends()
    return render_template('dashboard.html', trends=trends)

@app.route('/journal')
def journal():
    return render_template('journal.html')

@app.route('/ai_chat')
def ai_chat():
    return render_template('ai_chat.html')

@app.route('/analytics')
def analytics():
    insights = user_data.get_weekly_trends()
    return render_template('analytics.html', insights=insights)

# Enhanced API endpoints
@app.route('/api/analyze_mood', methods=['POST'])
def api_analyze_mood():
    try:
        data = request.get_json()
        text = data.get('text', '')
        current_glucose = data.get('current_glucose', 100)
        
        mood_data = mood_analyzer.analyze_text(text)
        glucose_prediction = mood_analyzer.predict_glucose_impact(mood_data, current_glucose)
        
        # Generate insight
        insight = generate_insight(mood_data, glucose_prediction)
        
        analysis_entry = {
            'text': text,
            'mood_data': mood_data,
            'glucose_prediction': glucose_prediction,
            'insight': insight,
            'timestamp': datetime.now().isoformat()
        }
        user_data.mood_entries.append(analysis_entry)
        
        return jsonify({
            'success': True,
            'mood_data': mood_data,
            'glucose_prediction': glucose_prediction,
            'insight': insight
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/chat', methods=['POST'])
def api_chat():
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        
        if not user_message.strip():
            return jsonify({
                'success': False,
                'error': 'Empty message'
            }), 400
        
        # Get context for more intelligent responses
        recent_data = {
            'last_glucose': user_data.glucose_readings[-1]['value'] if user_data.glucose_readings else None,
            'last_mood': user_data.mood_entries[-1]['mood_data'] if user_data.mood_entries else None,
            'recent_insights': user_data.insights[-3:] if user_data.insights else []
        }
        
        ai_response = ai_companion.generate_response(user_message, recent_data)
        
        chat_entry = {
            'user_message': user_message,
            'ai_response': ai_response,
            'timestamp': datetime.now().isoformat()
        }
        user_data.chat_history.append(chat_entry)
        
        return jsonify({
            'success': True,
            'response': ai_response
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/insights')
def api_insights():
    trends = user_data.get_weekly_trends()
    return jsonify(trends)

def generate_insight(mood_data, glucose_prediction):
    """Generate intelligent insights from mood and glucose data"""
    if mood_data['sentiment'] == 'negative' and glucose_prediction['impact_direction'] == 'increase':
        return "Your current stress level may lead to elevated glucose. Consider stress-reduction techniques like deep breathing or a short walk."
    elif mood_data['sentiment'] == 'positive' and glucose_prediction['impact_direction'] == 'decrease':
        return "Positive mood appears to be helping your glucose levels. Keep engaging in activities that boost your mood!"
    else:
        return "Tracking your mood and glucose helps identify patterns. Continue logging to discover personalized insights."

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)