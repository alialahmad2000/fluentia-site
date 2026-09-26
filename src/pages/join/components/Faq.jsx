import { useState } from "react";
import { Plus } from "lucide-react";
import { FAQ } from "../joinContent";

export default function Faq() {
  const [open, setOpen] = useState(-1);

  return (
    <section className="j-section j-alt" aria-labelledby="j-faq-h">
      <div className="j-wrap j-narrow">
        <h2 id="j-faq-h" className="j-h2">{FAQ.h2}</h2>
        <div className="j-faq">
          {FAQ.items.map((item, i) => {
            const on = open === i;
            return (
              <div key={item.q} className={`j-faq-item${on ? " is-open" : ""}`}>
                <h3 className="j-faq-q">
                  <button
                    type="button"
                    id={`j-faq-b${i}`}
                    aria-expanded={on}
                    aria-controls={`j-faq-p${i}`}
                    onClick={() => setOpen(on ? -1 : i)}
                  >
                    <span>{item.q}</span>
                    <Plus size={20} aria-hidden="true" className="j-faq-icon" />
                  </button>
                </h3>
                <div id={`j-faq-p${i}`} role="region" aria-labelledby={`j-faq-b${i}`} className="j-faq-panel">
                  <div className="j-faq-panel-in">
                    <p>{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
