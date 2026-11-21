# Data & Storage

## Database tables

Only visitor form submissions are stored in the database. Services, products, projects, team profiles, and UI copy live in static code.

### `contact_messages`
| Column | Personal data | Notes |
|---|---|---|
| `id` | No | Auto-generated primary key |
| `request_id` | No | Client-generated idempotency key (`ON CONFLICT DO NOTHING`) |
| `full_name` | Yes | Visitor's name |
| `email` | Yes | Lower-cased e-mail address |
| `phone` | Yes | Optional phone number |
| `topic` | No | One of `general`, `call`, `support`, `careers`, `press` |
| `message` | Yes | Visitor's message |
| `locale` | No | `mn` or `en` |
| `consent_given` | No | Must be true |
| `status` | No | `new`, `handled`, `spam` |
| `created_at` | No | UTC timestamp |

### `quote_requests`
| Column | Personal data | Notes |
|---|---|---|
| `id` | No | Auto-generated primary key |
| `request_id` | No | Client-generated idempotency key (`ON CONFLICT DO NOTHING`) |
| `full_name` | Yes | Visitor's name |
| `company` | Yes | Optional company name |
| `email` | Yes | Lower-cased e-mail address |
| `phone` | Yes | Required phone number |
| `service` | No | One of `surveillance`, `access`, `network`, `audit` |
| `site_type` | No | One of `office`, `retail`, `warehouse`, `residential`, `industrial`, `other` |
| `product` | No | `camera`, `reader`, `hub`, or `NULL` |
| `preferred_contact` | No | `phone` or `email` |
| `details` | Yes | Site details |
| `locale` | No | `mn` or `en` |
| `consent_given` | No | Must be true |
| `status` | No | `new`, `contacted`, `closed`, `spam` |
| `created_at` | No | UTC timestamp |

## Retention & Access

- **Retention rule:** Contact messages are deleted after 24 months, and quote requests after 36 months (unless the visitor becomes a customer), matching the privacy policy.
- **Reading submissions:** In production, open the **Supabase Table Editor** (or connect to PostgreSQL as the database owner). There is no admin UI in this phase.
