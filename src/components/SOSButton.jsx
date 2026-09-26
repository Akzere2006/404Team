import React, { useState } from "react";

function SOSButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="sos-button"
        onClick={() => setOpen(true)}
        aria-label="SOS"
      >
        SOS
      </button>

      {open && (
        <div className="sos-overlay">
          <div className="sos-modal">

            <button
              className="sos-close"
              onClick={() => setOpen(false)}
            >
              ×
            </button>

            <div className="sos-icon">
              🆘
            </div>

            <h2>Экстренная помощь</h2>

            <p>
              Если существует угроза жизни или здоровью,
              вызовите экстренные службы.
            </p>

            <a
              href="tel:112"
              className="sos-call"
            >
              📞 Позвонить 112
            </a>

            <button
              className="sos-cancel"
              onClick={() => setOpen(false)}
            >
              Отмена
            </button>

          </div>
        </div>
      )}
    </>
  );
}

export default SOSButton;