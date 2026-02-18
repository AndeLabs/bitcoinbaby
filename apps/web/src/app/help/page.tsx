/**
 * Help/FAQ Page
 *
 * Comprehensive help documentation for BitcoinBaby.
 * - How to create a wallet
 * - How mining works
 * - How to care for your baby
 * - How to earn $BABY tokens
 * - How to send/receive Bitcoin
 * - Troubleshooting section
 * - Glossary of terms
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardContent, Button } from "@bitcoinbaby/ui";
import { useTutorialStore } from "@bitcoinbaby/core";
import { clsx } from "clsx";

type HelpSection =
  | "getting-started"
  | "wallet"
  | "mining"
  | "baby-care"
  | "tokens"
  | "transactions"
  | "troubleshooting"
  | "glossary";

interface FAQItem {
  question: string;
  answer: string;
}

interface GlossaryItem {
  term: string;
  definition: string;
}

// FAQ Data
const FAQS: Record<HelpSection, FAQItem[]> = {
  "getting-started": [
    {
      question: "Que es BitcoinBaby?",
      answer:
        "BitcoinBaby es un juego de crianza digital donde minas Bitcoin mientras cuidas a tu bebe virtual. Tu bebe crece y evoluciona con cada hash que minas, y ganas $BABY tokens como recompensa.",
    },
    {
      question: "Como empiezo?",
      answer:
        "1. Crea una wallet Bitcoin\n2. Nombra a tu baby\n3. Comienza a minar\n4. Cuida de tu baby (alimenta, juega, descansa)\n5. Mira como evoluciona y gana tokens!",
    },
    {
      question: "Es gratis?",
      answer:
        "Si! BitcoinBaby es completamente gratis. Usas tu propia computadora para minar y las recompensas van directamente a tu wallet Bitcoin.",
    },
    {
      question: "Necesito conocimientos tecnicos?",
      answer:
        "No! La interfaz es muy sencilla e intuitiva. El tutorial te guia paso a paso. Solo necesitas un navegador web moderno.",
    },
  ],
  wallet: [
    {
      question: "Como creo una wallet?",
      answer:
        "Ve a la pagina Wallet y sigue estos pasos:\n1. Haz clic en 'Crear Nueva Wallet'\n2. Mueve el mouse para generar entropia aleatoria\n3. Guarda tu frase de recuperacion de 12 palabras en un lugar seguro\n4. Crea una contrasena fuerte\n5. Listo! Tu wallet Taproot esta creada.",
    },
    {
      question: "Que es la frase de recuperacion?",
      answer:
        "Es un conjunto de 12 palabras que te permiten recuperar tu wallet en cualquier dispositivo. NUNCA la compartas con nadie y guardala en un lugar seguro offline.",
    },
    {
      question: "Como importo una wallet existente?",
      answer:
        "En la pagina Wallet, selecciona 'Importar Wallet' e ingresa tu frase de recuperacion de 12 palabras. Tu wallet se restaurara automaticamente.",
    },
    {
      question: "Que es una wallet Taproot?",
      answer:
        "Taproot (P2TR) es el tipo mas moderno de direccion Bitcoin. Ofrece mejor privacidad, menores fees, y es compatible con el protocolo Charms para tokens.",
    },
    {
      question: "Es segura mi wallet?",
      answer:
        "Si! Tu wallet esta encriptada con AES-256-GCM y se almacena localmente en tu dispositivo. Nunca enviamos tu clave privada a ningun servidor.",
    },
  ],
  mining: [
    {
      question: "Como funciona la mineria?",
      answer:
        "BitcoinBaby usa Proof of Useful Work (PoUW). Tu navegador calcula hashes SHA-256 que contribuyen a tareas utiles. Cada hash valido te da XP para tu baby y potencialmente $BABY tokens.",
    },
    {
      question: "Cuanto puedo minar?",
      answer:
        "Depende de tu hardware. Una PC normal puede alcanzar 10-50 KH/s. Dispositivos mas potentes con WebGPU pueden llegar a 1+ MH/s. Mientras mas minas, mas rapido crece tu baby!",
    },
    {
      question: "Afecta la mineria a mi computadora?",
      answer:
        "La mineria usa recursos de CPU/GPU, lo que puede calentar tu dispositivo y consumir mas bateria. Recomendamos minar cuando el dispositivo esta conectado a corriente.",
    },
    {
      question: "Puedo minar en mi telefono?",
      answer:
        "Si, pero el rendimiento sera menor que en una PC. Los telefonos modernos pueden minar, pero recomendamos tenerlos conectados al cargador.",
    },
    {
      question: "Que son los 'shares'?",
      answer:
        "Un share es una prueba de trabajo valida. Cada share te da XP y puede generar recompensas en $BABY tokens. Mientras mas shares, mejores recompensas!",
    },
  ],
  "baby-care": [
    {
      question: "Como cuido a mi baby?",
      answer:
        "Tu baby tiene 4 estadisticas principales:\n- Energia: Sube con descanso, baja minando\n- Felicidad: Sube jugando, baja con el tiempo\n- Hambre: Sube con el tiempo, baja alimentando\n- Salud: Depende de las otras estadisticas",
    },
    {
      question: "Que pasa si no cuido a mi baby?",
      answer:
        "Si las estadisticas bajan demasiado, tu baby puede enfermarse. Si la salud llega a 0, tu baby 'muere' y pierdes progreso. Pero puedes revivirlo perdiendo algunos niveles!",
    },
    {
      question: "Como funciona la evolucion?",
      answer:
        "Tu baby evoluciona cada 5 niveles:\n- Nivel 1-4: Egg (Huevo)\n- Nivel 5-9: Baby (Bebe)\n- Nivel 10-14: Child (Nino)\n- Nivel 15-19: Teen (Adolescente)\n- Nivel 20+: Adult (Adulto)\n\nCada etapa desbloquea bonus de minado!",
    },
    {
      question: "Que es el bonus de minado?",
      answer:
        "Cada evolucion aumenta tu bonus de minado. Un baby nivel 20 puede tener +100% de bonus, duplicando tus recompensas de $BABY tokens!",
    },
    {
      question: "Que es el 'decay'?",
      answer:
        "Si no minas por varios dias, tu baby puede perder XP gradualmente. Esto incentiva la participacion activa. Minar aunque sea un poco cada dia evita el decay.",
    },
  ],
  tokens: [
    {
      question: "Que son los $BABY tokens?",
      answer:
        "$BABY es un token en Bitcoin usando el protocolo Charms. Es una recompensa real por tu trabajo de mineria que puedes enviar, recibir, o guardar.",
    },
    {
      question: "Como gano $BABY tokens?",
      answer:
        "Ganas $BABY tokens cada vez que completas una prueba de trabajo valida (share). La cantidad depende de la dificultad y tu bonus de minado.",
    },
    {
      question: "Donde se guardan mis tokens?",
      answer:
        "Tus $BABY tokens estan en la blockchain de Bitcoin, asociados a tu direccion Taproot. Puedes verlos en cualquier explorador de Bitcoin compatible con Charms.",
    },
    {
      question: "Puedo vender mis $BABY tokens?",
      answer:
        "Los tokens $BABY son reales y transferibles. En el futuro podran ser intercambiados en mercados descentralizados compatibles con el protocolo Charms.",
    },
    {
      question: "Cuantos $BABY tokens existen?",
      answer:
        "El suministro de $BABY es finito y se distribuye unicamente a traves de mineria. Esto garantiza una distribucion justa entre todos los mineros.",
    },
  ],
  transactions: [
    {
      question: "Como recibo Bitcoin?",
      answer:
        "Comparte tu direccion Taproot (empieza con 'tb1p' en testnet o 'bc1p' en mainnet) o muestra tu codigo QR. Cualquiera puede enviarte Bitcoin a esa direccion.",
    },
    {
      question: "Como envio Bitcoin?",
      answer:
        "Ve a Wallet > Send, ingresa la direccion destino y el monto. Confirma la transaccion con tu contrasena. La transaccion se enviara a la red Bitcoin.",
    },
    {
      question: "Cuanto tardan las transacciones?",
      answer:
        "Las transacciones Bitcoin tipicamente se confirman en 10-60 minutos. Puedes ver el estado en un explorador de bloques usando el TXID.",
    },
    {
      question: "Que son los fees?",
      answer:
        "Los fees son pagos a los mineros de Bitcoin por procesar tu transaccion. Fees mas altos = confirmacion mas rapida. BitcoinBaby calcula fees optimos automaticamente.",
    },
    {
      question: "Que es testnet vs mainnet?",
      answer:
        "Testnet es una red de pruebas donde el Bitcoin no tiene valor real. Es perfecta para aprender. Mainnet es la red principal con Bitcoin real.",
    },
  ],
  troubleshooting: [
    {
      question: "La mineria no inicia",
      answer:
        "Verifica que:\n1. Tu wallet esta desbloqueada\n2. Tienes un baby creado\n3. Tu baby no esta dormido\n4. Tu navegador soporta Web Workers\n\nPrueba refrescar la pagina.",
    },
    {
      question: "Mi hashrate es muy bajo",
      answer:
        "El hashrate depende de tu hardware. Prueba:\n1. Cerrar otras pestanas del navegador\n2. Usar Chrome o Edge (mejor soporte WebGPU)\n3. Asegurar que tu dispositivo no esta en modo ahorro de bateria",
    },
    {
      question: "No puedo desbloquear mi wallet",
      answer:
        "Si olvidaste tu contrasena, la unica forma de recuperar tu wallet es usando tu frase de recuperacion de 12 palabras. Ve a Wallet > Delete & Restore.",
    },
    {
      question: "Mi baby esta enfermo/muerto",
      answer:
        "Si tu baby murio, puedes revivirlo perdiendo algunos niveles. Para evitar esto en el futuro, mantén sus estadisticas balanceadas y mina regularmente.",
    },
    {
      question: "No veo mis $BABY tokens",
      answer:
        "Los tokens pueden tardar en aparecer despues de minar. Verifica:\n1. Tu wallet esta en la red correcta (testnet/mainnet)\n2. La transaccion fue confirmada\n3. Refresca la pagina o espera unos minutos",
    },
    {
      question: "La pagina no carga correctamente",
      answer:
        "Prueba:\n1. Limpiar cache del navegador\n2. Deshabilitar extensiones del navegador\n3. Usar otro navegador (Chrome/Edge recomendados)\n4. Verificar tu conexion a internet",
    },
  ],
  glossary: [],
};

// Glossary Data
const GLOSSARY: GlossaryItem[] = [
  {
    term: "Bitcoin",
    definition:
      "La primera y mas grande criptomoneda del mundo, creada en 2009 por Satoshi Nakamoto.",
  },
  {
    term: "Blockchain",
    definition:
      "Un libro contable digital distribuido que registra todas las transacciones de forma inmutable.",
  },
  {
    term: "Charms",
    definition:
      "Un protocolo para crear y transferir tokens en Bitcoin de forma nativa, sin necesidad de otra blockchain.",
  },
  {
    term: "Decay",
    definition:
      "Perdida gradual de XP cuando no minas por un periodo prolongado.",
  },
  {
    term: "Entropia",
    definition:
      "Aleatoriedad usada para generar claves criptograficas seguras.",
  },
  {
    term: "Fee",
    definition:
      "Pago a los mineros de Bitcoin por incluir tu transaccion en un bloque.",
  },
  {
    term: "Hash",
    definition:
      "Una funcion matematica que convierte datos en una cadena unica de caracteres fijos.",
  },
  {
    term: "Hashrate",
    definition:
      "La velocidad de calculo de hashes, medida en hashes por segundo (H/s).",
  },
  {
    term: "HD Wallet",
    definition:
      "Hierarchical Deterministic Wallet. Genera multiples direcciones desde una sola semilla.",
  },
  {
    term: "Mainnet",
    definition:
      "La red principal de Bitcoin donde las transacciones tienen valor real.",
  },
  {
    term: "Mnemonic",
    definition:
      "Frase de 12 o 24 palabras que representa tu clave privada de forma legible.",
  },
  {
    term: "P2TR",
    definition:
      "Pay-to-Taproot. El tipo de direccion Bitcoin mas moderno y eficiente.",
  },
  {
    term: "PoUW",
    definition:
      "Proof of Useful Work. Mineria que contribuye a tareas computacionales utiles.",
  },
  {
    term: "PSBT",
    definition:
      "Partially Signed Bitcoin Transaction. Formato estandar para transacciones no firmadas.",
  },
  {
    term: "Satoshi",
    definition:
      "La unidad mas pequena de Bitcoin. 1 BTC = 100,000,000 satoshis.",
  },
  {
    term: "Share",
    definition:
      "Una prueba de trabajo valida que demuestra que realizaste calculos de mineria.",
  },
  {
    term: "Taproot",
    definition:
      "Actualizacion de Bitcoin de 2021 que mejora privacidad, eficiencia y funcionalidad.",
  },
  {
    term: "Testnet",
    definition:
      "Red de pruebas de Bitcoin donde las monedas no tienen valor real.",
  },
  {
    term: "TXID",
    definition:
      "Transaction ID. Identificador unico de una transaccion en la blockchain.",
  },
  {
    term: "UTXO",
    definition:
      "Unspent Transaction Output. Una 'moneda' de Bitcoin que puedes gastar.",
  },
  {
    term: "WebGPU",
    definition:
      "API de navegador para acceder a la GPU, permitiendo mineria mas rapida.",
  },
  {
    term: "Web Worker",
    definition:
      "Proceso en segundo plano del navegador que permite minar sin bloquear la interfaz.",
  },
  {
    term: "XP",
    definition:
      "Experience Points. Puntos de experiencia que hacen crecer a tu baby.",
  },
];

// Section Navigation
const SECTIONS: { id: HelpSection; label: string; icon: string }[] = [
  { id: "getting-started", label: "Empezar", icon: "🚀" },
  { id: "wallet", label: "Wallet", icon: "💼" },
  { id: "mining", label: "Mineria", icon: "⛏️" },
  { id: "baby-care", label: "Cuidados", icon: "❤️" },
  { id: "tokens", label: "Tokens", icon: "🪙" },
  { id: "transactions", label: "Transacciones", icon: "📤" },
  { id: "troubleshooting", label: "Problemas", icon: "🔧" },
  { id: "glossary", label: "Glosario", icon: "📖" },
];

// FAQ Item Component
function FAQItemComponent({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-2 border-pixel-border mb-3 last:mb-0">
      <button
        onClick={onToggle}
        className={clsx(
          "w-full p-4 text-left flex items-center justify-between",
          "hover:bg-pixel-bg-light transition-colors",
          isOpen && "bg-pixel-bg-light",
        )}
      >
        <span className="font-pixel text-xs text-pixel-text pr-4">
          {item.question}
        </span>
        <span
          className={clsx(
            "font-pixel text-pixel-primary text-lg transition-transform",
            isOpen && "rotate-45",
          )}
        >
          +
        </span>
      </button>
      {isOpen && (
        <div className="p-4 pt-0 border-t-2 border-pixel-border bg-pixel-bg-dark">
          <p className="font-pixel-body text-sm text-pixel-text-muted whitespace-pre-line leading-relaxed">
            {item.answer}
          </p>
        </div>
      )}
    </div>
  );
}

// Glossary Item Component
function GlossaryItemComponent({ item }: { item: GlossaryItem }) {
  return (
    <div className="p-4 border-2 border-pixel-border mb-3 last:mb-0 hover:border-pixel-primary transition-colors">
      <dt className="font-pixel text-sm text-pixel-primary mb-2">
        {item.term}
      </dt>
      <dd className="font-pixel-body text-sm text-pixel-text-muted">
        {item.definition}
      </dd>
    </div>
  );
}

export default function HelpPage() {
  const [activeSection, setActiveSection] =
    useState<HelpSection>("getting-started");
  const [openFAQs, setOpenFAQs] = useState<Set<string>>(new Set());
  const [glossarySearch, setGlossarySearch] = useState("");
  const tutorialStore = useTutorialStore();

  const toggleFAQ = (question: string) => {
    const newOpenFAQs = new Set(openFAQs);
    if (newOpenFAQs.has(question)) {
      newOpenFAQs.delete(question);
    } else {
      newOpenFAQs.add(question);
    }
    setOpenFAQs(newOpenFAQs);
  };

  const handleRestartTutorial = () => {
    tutorialStore.resetTutorial();
    tutorialStore.startTutorial();
    window.location.href = "/";
  };

  // Filter glossary items
  const filteredGlossary = GLOSSARY.filter(
    (item) =>
      item.term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
      item.definition.toLowerCase().includes(glossarySearch.toLowerCase()),
  );

  return (
    <main className="min-h-screen p-4 md:p-8 bg-pixel-bg-dark">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-pixel text-xl text-pixel-primary">
                AYUDA & FAQ
              </h1>
              <p className="font-pixel-body text-sm text-pixel-text-muted mt-2">
                Todo lo que necesitas saber sobre BitcoinBaby
              </p>
            </div>
            <Link
              href="/"
              className="font-pixel text-[8px] text-pixel-text-muted hover:text-pixel-primary"
            >
              ← VOLVER
            </Link>
          </div>
        </header>

        {/* Restart Tutorial Card */}
        <Card className="mb-8 border-pixel-secondary">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <span className="text-3xl">🎓</span>
              <div>
                <h3 className="font-pixel text-sm text-pixel-secondary">
                  Tutorial Interactivo
                </h3>
                <p className="font-pixel-body text-xs text-pixel-text-muted">
                  Revive el tutorial paso a paso
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRestartTutorial}
            >
              VER TUTORIAL
            </Button>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-[200px_1fr] gap-6">
          {/* Section Navigation */}
          <nav className="space-y-2">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={clsx(
                  "w-full p-3 text-left font-pixel text-[10px]",
                  "border-2 transition-all",
                  activeSection === section.id
                    ? "bg-pixel-primary text-pixel-text-dark border-black shadow-[4px_4px_0_0_#000]"
                    : "bg-pixel-bg-medium text-pixel-text-muted border-pixel-border hover:border-pixel-primary",
                )}
              >
                <span className="mr-2">{section.icon}</span>
                {section.label.toUpperCase()}
              </button>
            ))}
          </nav>

          {/* Content Area */}
          <div className="bg-pixel-bg-medium border-4 border-pixel-border p-6 shadow-[8px_8px_0_0_#000]">
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-pixel-border">
              <span className="text-3xl">
                {SECTIONS.find((s) => s.id === activeSection)?.icon}
              </span>
              <h2 className="font-pixel text-lg text-pixel-primary">
                {SECTIONS.find(
                  (s) => s.id === activeSection,
                )?.label.toUpperCase()}
              </h2>
            </div>

            {/* FAQ Content */}
            {activeSection !== "glossary" && (
              <div>
                {FAQS[activeSection].map((item) => (
                  <FAQItemComponent
                    key={item.question}
                    item={item}
                    isOpen={openFAQs.has(item.question)}
                    onToggle={() => toggleFAQ(item.question)}
                  />
                ))}
              </div>
            )}

            {/* Glossary Content */}
            {activeSection === "glossary" && (
              <div>
                {/* Search */}
                <div className="mb-6">
                  <input
                    type="text"
                    value={glossarySearch}
                    onChange={(e) => setGlossarySearch(e.target.value)}
                    placeholder="Buscar termino..."
                    className="w-full px-4 py-3 font-pixel-body text-sm bg-pixel-bg-dark border-2 border-pixel-border text-pixel-text placeholder:text-pixel-text-muted focus:border-pixel-primary outline-none"
                  />
                </div>

                {/* Glossary List */}
                <dl className="space-y-0">
                  {filteredGlossary.map((item) => (
                    <GlossaryItemComponent key={item.term} item={item} />
                  ))}
                </dl>

                {filteredGlossary.length === 0 && (
                  <p className="text-center py-8 font-pixel-body text-pixel-text-muted">
                    No se encontraron terminos para &quot;{glossarySearch}&quot;
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Contact Section */}
        <Card className="mt-8">
          <CardHeader>
            <h3 className="font-pixel text-sm text-pixel-primary">
              NECESITAS MAS AYUDA?
            </h3>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://discord.gg/bitcoinbaby"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#5865F2] text-white font-pixel text-[10px] border-2 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] transition-all"
              >
                <span>💬</span> DISCORD
              </a>
              <a
                href="https://twitter.com/bitcoinbabyapp"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-pixel-bg-light text-pixel-text font-pixel text-[10px] border-2 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] transition-all"
              >
                <span>🐦</span> TWITTER
              </a>
              <a
                href="https://github.com/bitcoinbaby"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-pixel-bg-light text-pixel-text font-pixel text-[10px] border-2 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] transition-all"
              >
                <span>📁</span> GITHUB
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t-2 border-pixel-border text-center">
          <p className="font-pixel-body text-sm text-pixel-text-muted">
            BitcoinBaby v0.1.0 - Built on Bitcoin with Charms Protocol
          </p>
        </footer>
      </div>
    </main>
  );
}
