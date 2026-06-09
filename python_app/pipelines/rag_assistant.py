import os
import sys
from google import genai

sys.stdout.reconfigure(encoding='utf-8')

# 1. Grab environment variable if present
api_key = os.environ.get("GEMINI_API_KEY")

# Fallback block: If terminal didn't pass the key, use your hardcoded one
if not api_key:
    api_key = "enter API key here" # <-- Your real key goes here inside quotes!

# Initialize the global client once using our verified key configuration
client = genai.Client(api_key=api_key)

def load_project_context() -> str:
    """
    Reads local markdown files from the repository root AND scans loose files
    inside the clinical_knowledge folder to build a unified local knowledge base.
    """
    context_data = []
    
    # Path navigation to get back to the root directory
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    
    # --- TASK 1: Read Project Metadata Files ---
    target_files = ["PLAN.md", "SPEC.md", "ideas.md"]
    for file_name in target_files:
        file_path = os.path.join(root_dir, file_name)
        if os.path.exists(file_path):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    context_data.append(f"--- START OF FILE [PROJECT_DOC]: {file_name} ---\n{f.read()}\n--- END OF FILE ---")
            except Exception:
                pass

    # --- TASK 2: Scan clinical_knowledge Directory ---
    clinical_dir = os.path.join(root_dir, "clinical_knowledge")
    if os.path.exists(clinical_dir):
        for root, dirs, files in os.walk(clinical_dir):
            for file_name in files:
                # Look for loose text or markdown files
                if file_name.endswith((".txt", ".md")):
                    file_path = os.path.join(root, file_name)
                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            context_data.append(f"--- START OF FILE [CLINICAL_REF]: {file_name} ---\n{f.read()}\n--- END OF FILE ---")
                    except Exception:
                        pass
                        
    return "\n".join(context_data)

def query_rag_assistant(user_question: str) -> str:
    """
    Retrieves project context data and queries Gemini using the globally authorized client configuration.
    """
    # 1. Gather documents
    local_knowledge = load_project_context()
    
    # If no files are ready yet, we will explicitly pass a warning context instead of completely breaking the process
    if not local_knowledge:
        local_knowledge = "Notice: No local reference files or clinical guidelines were found in the workspace paths."

    try:
        # 2. Use the GLOBAL 'client' we created at the top of the file! Do NOT overwrite it here.
        
        # 3. Construct the Augmented Prompt
        augmented_prompt = f"""
        You are an expert AI clinical assistant integrated into the 'fetal-mri' workspace platform.
        Below is the explicit context gathered from local architecture documents and clinical guide files:
        
        {local_knowledge}
        
        Using the reference documents provided above, answer the following user question clearly and concisely.
        If the question touches on medical or architectural criteria not covered by the context files, 
        use your advanced diagnostic and software engineering knowledge to formulate a safe, professional guide response.
        
        User Question: {user_question}
        """
        
        # 4. Generate the Response using the global client configuration
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=augmented_prompt
        )
        return response.text

    except Exception as e:
        return f"RAG Pipeline Error: {str(e)}"

# Execution loop for terminal integration
if __name__ == "__main__":
    if len(sys.argv) > 1:
        user_question = sys.argv[1]
    else:
        user_question = "What are the remaining tasks in our project plan?"
        
    try:
        # 2. Run your RAG query logic (make sure this matches your function name)
        answer = query_rag_assistant(user_question)
        
        # 3. Print the answer directly and force the output stream clear
        print(answer)
        sys.stdout.flush()
        
    except Exception as e:
        # If an internal error occurs, print it so Node can display it in the log
        print(f"Internal Python Error: {str(e)}")
        sys.stdout.flush()
    