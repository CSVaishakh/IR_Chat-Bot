from fastapi import FastAPI, File, UploadFile, Form, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image
import torch
from transformers import BlipProcessor, BlipForConditionalGeneration, RobertaTokenizer, RobertaForQuestionAnswering
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the 'frontend' folder to serve static files
app.mount("/frontend", StaticFiles(directory="frontend"), name="frontend")

# Jinja2 template instance for rendering HTML templates
templates = Jinja2Templates(directory="templates")

# Load the models
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-large")
model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-large")
tokenizer = RobertaTokenizer.from_pretrained("deepset/roberta-base-squad2")
model_roberta = RobertaForQuestionAnswering.from_pretrained("deepset/roberta-base-squad2")

def generate_caption(image: Image.Image) -> str:
    image = image.convert("RGB")
    inputs = processor(image, return_tensors='pt')
    outputs = model.generate(**inputs)
    caption = processor.decode(outputs[0], skip_special_tokens=True)
    return caption

def answer_question(question: str, context: str) -> str:
    inputs = tokenizer(question, context, return_tensors='pt', truncation=True)
    with torch.no_grad():
        outputs = model_roberta(**inputs)

    start_idx = torch.argmax(outputs.start_logits)
    end_idx = torch.argmax(outputs.end_logits) + 1

    answer = tokenizer.convert_tokens_to_string(tokenizer.convert_ids_to_tokens(inputs["input_ids"][0][start_idx:end_idx]))
    return answer

# Route for rendering the HTML frontend
@app.get("/", response_class=HTMLResponse)
async def get_index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# Endpoint for caption generation
@app.post("/generate-caption")
async def generate_caption_endpoint(image: UploadFile = File(...)):
    image = Image.open(image.file)
    caption = generate_caption(image)
    return {"caption": caption}

# Endpoint for answering a question based on context
@app.post("/answer-question")
async def answer_question_endpoint(question: str = Form(...), context: str = Form(...)):
    answer = answer_question(question, context)
    return {"answer": answer}
