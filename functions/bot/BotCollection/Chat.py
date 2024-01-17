# path/to/your/python_script.py
import sys
from openai import OpenAI

# Extract user content from command line arguments
user_content = sys.argv[1]

client = OpenAI(api_key='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')

completion = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "system", "content": "You are a helpful assistant. Please summarize the given content and analyze it"},
        {"role": "user", "content": user_content}
    ]
)

print(completion.choices[0].message.content)
