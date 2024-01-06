# Usa una versione specifica di Python per garantire la stabilità
FROM python:3.9

# Imposta la directory di lavoro
WORKDIR /usr/src/app

# Imposta le variabili d'ambiente
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Installa le dipendenze
COPY ./requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copia il progetto nella directory di lavoro
COPY . .

RUN mkdir staticfiles
