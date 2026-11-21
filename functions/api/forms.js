import { contactSchema, fieldCodes, quoteSchema } from '../../shared/schemas.js';
import { errorCode } from '../lib/errorCode.js';

const isHoneypotFilled = (body) => typeof body?.website === 'string' && body.website.trim() !== '';

function formHandler({ schema, name, isDbReady, save }) {
  return async (req, res) => {
    // A bot that fills the hidden field gets the normal answer and nothing is stored.
    if (isHoneypotFilled(req.body)) return res.status(200).json({ ok: true });

    const parsed = schema.safeParse(req.body ?? {});
    if (!parsed.success) return res.status(400).json({ ok: false, code: 'invalid', fields: fieldCodes(parsed.error, req.body) });
    if (!isDbReady()) return res.status(503).json({ ok: false, code: 'unavailable' });

    try {
      await save(parsed.data);
      return res.status(201).json({ ok: true });
    } catch (error) {
      console.error(`[${name}] ${errorCode(error)}`);
      return res.status(503).json({ ok: false, code: 'unavailable' });
    }
  };
}

export const contactHandler = (repo, isDbReady) =>
  formHandler({
    schema: contactSchema,
    name: 'contact',
    isDbReady,
    save: (data) =>
      repo.createContactMessage({
        requestId: data.requestId,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || null,
        topic: data.topic,
        message: data.message,
        locale: data.locale,
        consentGiven: data.consent,
      }),
  });

export const quoteHandler = (repo, isDbReady) =>
  formHandler({
    schema: quoteSchema,
    name: 'quote',
    isDbReady,
    save: (data) =>
      repo.createQuoteRequest({
        requestId: data.requestId,
        fullName: data.fullName,
        company: data.company || null,
        email: data.email,
        phone: data.phone,
        service: data.service,
        siteType: data.siteType,
        product: data.product || null,
        preferredContact: data.preferredContact,
        details: data.details,
        locale: data.locale,
        consentGiven: data.consent,
      }),
  });
