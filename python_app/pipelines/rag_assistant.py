import os
import sys
from google import genai

def load_project_context() -> str:
    """
    Reads local markdown files from the repository root to build a local knowledge base.
    """
    context_data = []
    # Path navigation to get back to the root directory where your markdown files live
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    
    # Target files to extract project memory from
    target_files = ["PLAN.md", "SPEC.md", "ideas.md"]
    
    for file_name in target_files:
        file_path = os.path.join(root_dir, file_name)
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                context_data.append(f"--- START OF FILE: {file_name} ---\n{f.read()}\n")
                
    return "\n".join(context_data)

def query_rag_assistant(user_question: str) -> str:
    """
    Retrieves the repository markdown data and uses Gemini to answer questions with local context.
    """
    # 1. Gather documents (The "Retrieval" part of RAG)
    local_knowledge = load_project_context()
    if not local_knowledge:
        return "No project files found. Please check your root directory markdown paths."

    # 2. Set up the Gemini Client
    # Make sure you have your GEMINI_API_KEY set in your terminal environment!
    try:
        client = genai.Client()
        
        # 3. Construct the Augmented Prompt
        augmented_prompt = f"""
        You are an expert AI assistant specialized in analyzing the 'fetal-mri' project codebase.
        Below is the explicit architectural context retrieved from local project files:
        
        {local_knowledge}
        
        Using only the context provided above, answer the following user question. 
        If the answer cannot be found in the files, use your best software judgment to guide them.
        
        User Question: {user_question}
        """
        
        # 4. Generate the Response
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=augmented_prompt
        )
        return response.text

    except Exception as e:
        return f"RAG Pipeline Error: {str(e)}"

# Quick execution block to test it inside the terminal
if __name__ == "__main__":
    # Check if Node.js passed a custom question as a command-line argument
    if len(sys.argv) > 1:
        user_question = sys.argv[1]
    else:
        user_question = "What are the remaining tasks in our project plan?"
        
    # Execute and print the clean output back to Node.js
    answer = query_rag_assistant(user_question)
    print(answer)