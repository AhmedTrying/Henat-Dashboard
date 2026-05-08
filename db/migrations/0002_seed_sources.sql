-- Seed the trusted sources allowlist. Idempotent.
insert into trusted_sources (code, name, tier, url, country_code, enabled) values
  ('WHO',      'World Health Organization',                  'global',   'https://www.who.int/emergencies/disease-outbreak-news', null, true),
  ('CDC',      'U.S. Centers for Disease Control',           'national', 'https://www.cdc.gov/hantavirus/',                       'US', true),
  ('ECDC',     'European Centre for Disease Prevention',     'regional', 'https://www.ecdc.europa.eu/en/hantavirus-infection',    null, true),
  ('PAHO',     'Pan American Health Organization',           'regional', 'https://www.paho.org/en',                               null, true),
  ('MS-AR',    'Ministerio de Salud, Argentina',             'national', 'https://www.argentina.gob.ar/salud',                    'AR', true),
  ('MINSAL',   'Ministerio de Salud, Chile',                 'national', 'https://www.minsal.cl/',                                'CL', true),
  ('MS-BR',    'Ministério da Saúde, Brasil',                'national', 'https://www.gov.br/saude/pt-br',                        'BR', true),
  ('MINSA-PA', 'Ministerio de Salud, Panamá',                'national', 'https://www.minsa.gob.pa/',                             'PA', true),
  ('KKM',      'Ministry of Health, Malaysia',               'national', 'https://www.moh.gov.my/',                               'MY', true),
  ('MoH-SA',   'Ministry of Health, Saudi Arabia',           'national', 'https://www.moh.gov.sa/',                               'SA', true),
  ('Kemenkes', 'Kementerian Kesehatan, Indonesia',           'national', 'https://www.kemkes.go.id/',                             'ID', true)
on conflict (code) do update
  set name = excluded.name,
      tier = excluded.tier,
      url = excluded.url,
      country_code = excluded.country_code,
      enabled = excluded.enabled,
      updated_at = now();
