import * as React from "react";

import { SITE } from "@/content/site";
import { useTranslation } from "@/i18n/use-translation";
import { buildMailtoHref } from "@/lib/mailto";

export function ContactApp() {
  const { t } = useTranslation();
  const [name, setName] = React.useState("");
  const [message, setMessage] = React.useState("");

  const href = buildMailtoHref({
    to: SITE.email,
    subject: t("contact.subject"),
    body: `${message}\n\n— ${name}`,
  });

  return (
    <div className="space-y-3 p-4 font-terminal text-sm">
      <h3 className="font-pixel text-xs">{t("contact.title")}</h3>
      <div className="grid grid-cols-[2fr_1fr] gap-3 border-2 border-ink bg-cream p-3 shadow-hard-sm">
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={t("contact.message")}
          rows={5}
          className="resize-none border-2 border-ink bg-white/60 p-2 text-xs"
        />
        <div className="flex flex-col justify-between gap-2 border-l-2 border-dashed border-ink pl-3">
          <div className="self-end border-2 border-ink bg-sun px-2 py-1 text-lg">
            🏄
          </div>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t("contact.name")}
            className="border-2 border-ink bg-white/60 p-2 text-xs"
          />
          <a
            href={href}
            className="border-2 border-ink bg-coral-soft px-2 py-2 text-center font-pixel text-[10px] text-white shadow-hard-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
          >
            {t("contact.send")}
          </a>
        </div>
      </div>
      <p className="text-xs font-bold">{t("contact.socials")}</p>
      <ul className="flex flex-wrap gap-2 text-xs">
        {SITE.socials.map((social) => (
          <li key={social.label}>
            <a
              href={social.url}
              target="_blank"
              rel="noreferrer"
              className="inline-block -rotate-2 border-2 border-ink bg-lagoon px-2 py-1 text-white shadow-hard-sm hover:rotate-0"
            >
              {social.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
