const brokerUrl = "wss://broker.hivemq.com:8884/mqtt";

// Tópicos MQTT utilizados no projeto
const topicoSensor = "May/lerSensor"; // Tópico que envia dados do sensor
const topicoLed1 = "May/led1"; // Tópico para controlar o LED 1
const topicoLed2 = "May/led2"; // Tópico para controlar o LED 2

// Gera um ID único para o cliente MQTT (evita conflito de conexões)
const clientID = "webClient_" + Math.floor(Math.random() * 10000);

// Cria uma instância do cliente MQTT da biblioteca Paho usando WSS
const client = new Paho.MQTT.Client(brokerUrl, clientID);

// Define o tempo limite de reconexão (em milissegundos)
const reconnectTimeout = 2000;

// Define função chamada automaticamente quando uma mensagem chega
client.onMessageArrived = (message) => {
  console.log(
    "📥 Message received:",
    message.destinationName,
    message.payloadString
  );

  // Verifica se a mensagem recebida é do tópico de leitura do sensor
  if (message.destinationName === topicoSensor) {
    try {
      // Converte a string JSON recebida em um objeto JavaScript
      const dados = JSON.parse(message.payloadString);

      // Atualiza elementos HTML com os valores de temperatura e umidade
      document.getElementById("temp").innerText = dados.temperature;
      document.getElementById("umid").innerText = dados.humidity;
    } catch (e) {
      // Exibe erro se o JSON estiver malformado
      console.error("❌ Error parsing JSON:", e);
    }
  }
};

// Conecta o cliente ao broker MQTT com SSL ativado
client.connect({
  useSSL: true, // obrigatório para conexões WSS (WebSocket Secure)

  // Se conectar com sucesso, mostra mensagem e se inscreve no tópico do sensor
  onSuccess: () => {
    console.log("✅ Connected to the MQTT broker");
    client.subscribe(topicoSensor); // começa a escutar dados do sensor
  },

  // Se falhar ao conectar, exibe mensagem de erro
  onFailure: (err) => {
    console.error("❌ Connection failed:", err);
  },
});

// 💡 Função para enviar comando a um dos LEDs via MQTT
function enviarComando(led, estado) {
  // Escolhe o tópico correto com base no LED selecionado
  const topico = led === "led1" ? topicoLed1 : topicoLed2;

  // Cria a mensagem MQTT com o estado desejado ("1" ou "0")
  const message = new Paho.MQTT.Message(estado);

  // Define para qual tópico essa mensagem será enviada
  message.destinationName = topico;

  // Envia a mensagem ao broker
  client.send(message);

  // Log no console indicando que a mensagem foi enviada
  console.log(`📤 Enviado para ${topico}: ${estado}`);
}
