from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST"],
    allow_headers=["*"],
)

model_name = "cnmoro/Qwen2.5-0.5B-Portuguese-Hybrid-Reasoning"
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype="auto",
    device_map="auto"
)
tokenizer = AutoTokenizer.from_pretrained(model_name)

SYSTEM_PROMPT = (
    "És a assistente virtual da B.Uman, um serviço para mulheres que precisam de ajuda "
    "com burocracia (B.Quick, 9€, e B.Guidance, 19€), desabafo (B.Talk, 19€) e cuidado "
    "pessoal (ritual facial Kôbido, 1 hora, 39,50€). "
    "Responde sempre em português, de forma breve, calorosa e clara. "
    "Se não souberes responder com certeza, sugere que a pessoa fale diretamente com a Eli."
)

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
def chat(req: ChatRequest):
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": req.message}
    ]
    inputs = tokenizer.apply_chat_template(
        messages,
        add_generation_prompt=True,
        return_tensors="pt"
    ).to(model.device)

    outputs = model.generate(
        inputs,
        max_new_tokens=200,
        do_sample=True,
        temperature=0.7,
        top_p=0.9
    )

    resposta_completa = tokenizer.decode(outputs[0][inputs.shape[-1]:], skip_special_tokens=True)
    return {"resposta": resposta_completa.strip()}
