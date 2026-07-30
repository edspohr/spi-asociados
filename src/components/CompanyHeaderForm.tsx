import type { CompanyErrors, CompanyInfo } from '../types/form';
import { sanitizePhoneInput } from '../lib/validation';

type Props = {
  value: CompanyInfo;
  errors: CompanyErrors;
  onChange: (next: CompanyInfo) => void;
};

export function CompanyHeaderForm({ value, errors, onChange }: Props) {
  function update<K extends keyof CompanyInfo>(key: K, v: CompanyInfo[K]) {
    onChange({ ...value, [key]: v });
  }

  function addEmail() {
    update('correosAdicionales', [...value.correosAdicionales, '']);
  }

  function updateEmailAt(idx: number, v: string) {
    const next = [...value.correosAdicionales];
    next[idx] = v;
    update('correosAdicionales', next);
  }

  function removeEmailAt(idx: number) {
    update(
      'correosAdicionales',
      value.correosAdicionales.filter((_, i) => i !== idx),
    );
  }

  return (
    <section
      aria-labelledby="header-title"
      className="rounded-lg border border-border bg-surface p-6"
    >
      <header className="mb-4">
        <h2 id="header-title" className="text-lg font-semibold text-primary">
          Datos de la empresa
        </h2>
        <p className="text-sm text-text-muted">
          Los campos marcados con <span className="text-danger">★</span> son
          obligatorios.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Razón social"
          required
          error={errors.razonSocial}
          hint="Nombre completo de la sociedad."
        >
          <input
            type="text"
            value={value.razonSocial}
            onChange={(e) => update('razonSocial', e.target.value)}
            aria-invalid={Boolean(errors.razonSocial)}
            className={inputCls(errors.razonSocial)}
          />
        </Field>

        <Field label="DBA" hint="Nombre comercial (si aplica)." error={errors.dba}>
          <input
            type="text"
            value={value.dba}
            onChange={(e) => update('dba', e.target.value)}
            className={inputCls(errors.dba)}
          />
        </Field>

        <Field label="País de origen" required error={errors.paisOrigen}>
          <input
            type="text"
            value={value.paisOrigen}
            onChange={(e) => update('paisOrigen', e.target.value)}
            aria-invalid={Boolean(errors.paisOrigen)}
            className={inputCls(errors.paisOrigen)}
          />
        </Field>

        <Field label="Año de inicio de operaciones" error={errors.anioInicio}>
          <input
            type="number"
            inputMode="numeric"
            min={1800}
            max={new Date().getFullYear()}
            value={value.anioInicio}
            onChange={(e) => update('anioInicio', e.target.value)}
            aria-invalid={Boolean(errors.anioInicio)}
            className={inputCls(errors.anioInicio)}
          />
        </Field>

        <Field label="Número de empleados" error={errors.numEmpleados}>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={value.numEmpleados}
            onChange={(e) => update('numEmpleados', e.target.value)}
            aria-invalid={Boolean(errors.numEmpleados)}
            className={inputCls(errors.numEmpleados)}
          />
        </Field>

        <Field label="Representante legal" error={errors.repLegal}>
          <input
            type="text"
            value={value.repLegal}
            onChange={(e) => update('repLegal', e.target.value)}
            className={inputCls(errors.repLegal)}
          />
        </Field>
      </div>

      <Fieldset legend="Contacto principal">
        <Field label="Nombre" required error={errors.contactoPrincipalNombre}>
          <input
            type="text"
            value={value.contactoPrincipalNombre}
            onChange={(e) => update('contactoPrincipalNombre', e.target.value)}
            aria-invalid={Boolean(errors.contactoPrincipalNombre)}
            className={inputCls(errors.contactoPrincipalNombre)}
          />
        </Field>
        <Field label="Correo" required error={errors.contactoPrincipalCorreo}>
          <input
            type="email"
            autoComplete="email"
            value={value.contactoPrincipalCorreo}
            onChange={(e) => update('contactoPrincipalCorreo', e.target.value)}
            aria-invalid={Boolean(errors.contactoPrincipalCorreo)}
            className={inputCls(errors.contactoPrincipalCorreo)}
          />
        </Field>
        <Field label="Teléfono" error={errors.contactoPrincipalTelefono}>
          <input
            type="tel"
            inputMode="tel"
            value={value.contactoPrincipalTelefono}
            onChange={(e) =>
              update('contactoPrincipalTelefono', sanitizePhoneInput(e.target.value))
            }
            className={inputCls(errors.contactoPrincipalTelefono)}
          />
        </Field>
      </Fieldset>

      <Fieldset legend="Contacto regulatorio">
        <Field label="Nombre" error={errors.contactoRegulatorioNombre}>
          <input
            type="text"
            value={value.contactoRegulatorioNombre}
            onChange={(e) => update('contactoRegulatorioNombre', e.target.value)}
            className={inputCls(errors.contactoRegulatorioNombre)}
          />
        </Field>
        <Field label="Correo" error={errors.contactoRegulatorioCorreo}>
          <input
            type="email"
            value={value.contactoRegulatorioCorreo}
            onChange={(e) => update('contactoRegulatorioCorreo', e.target.value)}
            aria-invalid={Boolean(errors.contactoRegulatorioCorreo)}
            className={inputCls(errors.contactoRegulatorioCorreo)}
          />
        </Field>
        <Field label="Teléfono" error={errors.contactoRegulatorioTelefono}>
          <input
            type="tel"
            inputMode="tel"
            value={value.contactoRegulatorioTelefono}
            onChange={(e) =>
              update('contactoRegulatorioTelefono', sanitizePhoneInput(e.target.value))
            }
            className={inputCls(errors.contactoRegulatorioTelefono)}
          />
        </Field>
      </Fieldset>

      <fieldset className="mt-6 rounded-md border border-border p-4">
        <legend className="px-2 text-sm font-semibold text-primary">
          Correos adicionales
        </legend>
        <p className="mb-3 text-xs text-text-subtle">
          Opcional. Para enviar copias de esta información a más personas.
        </p>
        {value.correosAdicionales.length === 0 && (
          <p className="mb-3 text-xs text-text-muted">
            Aún no ha agregado correos.
          </p>
        )}
        <div className="flex flex-col gap-2">
          {value.correosAdicionales.map((email, idx) => {
            const err = errors.correosAdicionales?.[idx];
            return (
              <div key={idx} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => updateEmailAt(idx, e.target.value)}
                    aria-invalid={Boolean(err)}
                    placeholder="correo@ejemplo.com"
                    className={`flex-1 ${inputCls(err)}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeEmailAt(idx)}
                    className="rounded border border-border px-2 py-1 text-xs text-text-muted hover:border-danger hover:text-danger"
                  >
                    Quitar
                  </button>
                </div>
                {err && (
                  <span role="alert" className="text-xs text-danger">
                    {err}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={addEmail}
          className="mt-3 text-sm text-primary underline hover:opacity-80"
        >
          + Agregar correo
        </button>
      </fieldset>
    </section>
  );
}

function Fieldset({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="mt-6 rounded-md border border-border p-4">
      <legend className="px-2 text-sm font-semibold text-primary">
        {legend}
      </legend>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">{children}</div>
    </fieldset>
  );
}

function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-text">
        {label}
        {required && <span className="ml-1 text-danger">★</span>}
      </span>
      {children}
      {hint && !error && (
        <span className="text-xs text-text-subtle">{hint}</span>
      )}
      {error && (
        <span role="alert" className="text-xs text-danger">
          {error}
        </span>
      )}
    </label>
  );
}

function inputCls(err?: string): string {
  const base =
    'w-full rounded border bg-white px-3 py-2 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20';
  const border = err
    ? 'border-danger'
    : 'border-border';
  return `${base} ${border}`;
}
