export default function ContactPage() {
  return (
    <div className="mx-auto max-w-[480px] px-4 py-6 lg:max-w-2xl">
      <h1 className="mb-1 font-heading text-2xl font-semibold text-ink">Contact Us</h1>
      <p className="mb-5 text-xs text-ink-muted">We&apos;d love to hear from you</p>

      <div className="flex flex-col gap-4 text-sm leading-relaxed text-ink">
        <p>
          Have a question about an order, a saree, or anything else? We&apos;re setting up
          dedicated support channels and will have a phone number and email address here
          soon.
        </p>
        <p>
          In the meantime, you can reach us through the Instagram, WhatsApp, or Facebook
          icons in the menu — tap the menu icon at the top of the screen to find them.
        </p>
      </div>
    </div>
  );
}
