# Import required FastAPI components for building the API
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
# Import Pydantic for data validation and settings management
from pydantic import BaseModel
import os
from huggingface_hub import InferenceClient # Import the new client
from typing import Optional

# Initialize FastAPI application with a title
app = FastAPI(title="Hugging Face Chat API")

# Configure CORS (Cross-Origin Resource Sharing) middleware
# This allows the API to be accessed from different domains/origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows requests from any origin
    allow_credentials=True,  # Allows cookies to be included in requests
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers in requests
)

# Define the data model for chat requests using Pydantic
# This ensures incoming request data is properly validated
class ChatRequest(BaseModel):
    developer_message: str  # Message from the developer/system
    user_message: str      # Message from the user
    model: Optional[str] = "HuggingFaceTB/SmolLM3-3B"  # New default model
    hf_token: Optional[str] = None # User-provided Hugging Face token

# Define the main chat endpoint that handles POST requests
@app.post("/api/chat")
async def chat(request: ChatRequest):
    # Prioritize user-provided token, then environment variable
    hf_token = request.hf_token or os.getenv("HF_TOKEN")
    if not hf_token:
        raise HTTPException(status_code=500, detail="Hugging Face token not found. Please provide it in the request or set HF_TOKEN environment variable.")

    try:
        client = InferenceClient(
            provider="hf-inference",
            api_key=hf_token,
        )

        # Create an async generator function for streaming responses
        async def generate():
            stream = client.chat.completions.create(
                model=request.model,
                messages=[
                    {"role": "system", "content": request.developer_message},
                    {"role": "user", "content": request.user_message}
                ],
                stream=True,
            )
            
            # Yield each chunk of the response as it becomes available
            for chunk in stream:
                if chunk.choices and chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content

        # Return a streaming response to the client
        return StreamingResponse(generate(), media_type="text/plain")

    except Exception as e:
        # The huggingface_hub library raises generic exceptions, so we inspect the string
        error_message = str(e)
        raise HTTPException(status_code=500, detail=f"Hugging Face API request failed: {error_message}")

# Define a health check endpoint to verify API status
@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

# Entry point for running the application directly
if __name__ == "__main__":
    import uvicorn
    # Start the server on all network interfaces (0.0.0.0) on port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)
