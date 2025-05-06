import OpenAI from 'https://cdn.skypack.dev/openai';
import { GITHUB_TOKEN } from './config.js';

const token = GITHUB_TOKEN;

export async function main(userCommand) {
    const client = new OpenAI({
        baseURL: 'https://models.inference.ai.azure.com',
        apiKey: token,
        dangerouslyAllowBrowser: true
    });

    try {
        const response = await client.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are a task analyzer. Process the user's command: "${userCommand}"

                    **Steps**:
                    1. Correct the task description for grammar, spelling, capitalization, punctuation (e.g., commas, periods), and clarity. Ensure proper sentence structure and professional tone.
                    2. Extract the following details from the corrected description:
                       - Operation: "Add", "Delete", or "Update".
                       - Task: A concise title (max 5 words).
                       - Urgency: "HIGH", "MEDIUM", or "LOW".
                       - Date and Time: Human-readable format (e.g., "Tomorrow at 3 PM") or null if none.

                    **Grammatical Rules**:
                    - Capitalize the first letter of each sentence.
                    - Add appropriate commas, periods, and punctuation.
                    - Fix spelling errors and ensure clarity.
                    - Maintain the original intent of the command.

                    **Urgency Rules**:
                    - HIGH: Includes words like "urgent," "emergency," "critical," "ASAP," "today," or "now."
                    - MEDIUM: Includes words like "soon," "tomorrow," or a deadline within 48 hours.
                    - LOW: Includes words like "routine," "later," "next week," or no clear deadline.

                    **Output**:
                    - Return a JSON object with:
                      - operation: The operation (string).
                      - task: The concise title (string).
                      - urgency: The urgency level (string: "HIGH", "MEDIUM", "LOW").
                      - content: The grammatically corrected task description (string).
                      - dateTime: The extracted date/time (string or null).
                    - Respond with raw JSON, without Markdown code fences or extra text.
                    - Ensure the JSON is valid and properly formatted.
                    - The task field should be case-insensitive for comparison.

                    **Examples**:
                    - Input: "Add an urgent meeting today at 2 PM"
                      Output: {"operation":"Add","task":"Urgent Meeting","urgency":"HIGH","content":"Schedule an urgent meeting today at 2 PM.","dateTime":"Today at 2 PM"}
                    - Input: "Add an important report due tomorrow"
                      Output: {"operation":"Add","task":"Important Report","urgency":"MEDIUM","content":"Prepare an important report due tomorrow.","dateTime":"Tomorrow"}
                    - Input: "Add a routine checkup next week"
                      Output: {"operation":"Add","task":"Routine Checkup","urgency":"LOW","content":"Schedule a routine checkup next week.","dateTime":"Next Week"}
                    - Input: "add buy milk no comma"
                      Output: {"operation":"Add","task":"Buy Milk","urgency":"LOW","content":"Buy milk.","dateTime":null}

                    Return only the JSON object, e.g.:
                    {"operation":"Add","task":"Some Task","urgency":"HIGH","content":"Corrected description.","dateTime":null}`
                },
                {
                    role: 'user',
                    content: userCommand
                }
            ],
            model: 'gpt-4o',
            temperature: 0.7,
            max_tokens: 4096,
            top_p: 1
        });

        console.log('Raw OpenAI Response Content:', response.choices[0].message.content);
        return response;
    } catch (error) {
        console.error('OpenAI API error:', error);
        throw error;
    }
}