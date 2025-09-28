import google.generativeai as genai

genai.configure(api_key="AIzaSyDCzmApXjV0-P3N2wtmsxpoJp8woOezaIk")

class DiabetesAICompanion:
    def __init__(self):
        self.conversation_history = []
        self.persona = (
            "You are DiaMind, an expert AI diabetes mental health coach with 15 years of experience. "
            "You specialize in helping people manage the emotional challenges of diabetes.\n\n"
            "Key expertise:\n"
            "- Diabetes distress and burnout management\n"
            "- Stress-glucose connection\n"
            "- Motivational interviewing techniques\n"
            "- CBT strategies for diabetes management\n"
            "- Mindfulness and coping mechanisms\n\n"
            "Communication style:\n"
            "- EMPATHETIC but PROFESSIONAL\n"
            "- Ask probing questions to understand deeper issues\n"
            "- Provide evidence-based strategies\n"
            "- Help users identify patterns and triggers\n"
            "- Be conversational but authoritative\n"
            "- Use diabetes-specific terminology appropriately\n\n"
            "Always:\n"
            "- Acknowledge emotions first, then provide practical advice\n"
            "- Ask follow-up questions to encourage reflection\n"
            "- Provide actionable steps users can take immediately\n"
            "- Reference real diabetes research when appropriate\n"
        )
        self.model = genai.GenerativeModel("models/gemini-2.5-pro")

    def generate_response(self, user_message, user_data=None):
        # Build the prompt with persona and conversation history
        prompt = self.persona + "\n\n"
        for msg in self.conversation_history[-10:]:
            prompt += f"User: {msg['user']}\nAI: {msg['ai']}\n"
        prompt += f"User: {user_message}\nAI:"

        try:
            response = self.model.generate_content([prompt])
            ai_response = response.text.strip()
        except Exception as e:
            print("AI Error:", e)
            ai_response = (
                "Sorry, I'm having trouble connecting to the Gemini AI service right now. "
                "Please try again later."
            )

        self.conversation_history.append({"user": user_message, "ai": ai_response})

        if len(self.conversation_history) > 20:
            self.conversation_history = self.conversation_history[-10:]

        return ai_response