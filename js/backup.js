// ── FASTA — js/backup.js ──
// Export / import of all user data as a JSON file

import { SCHEMA_VERSION, SchemaTooNewError, migrate } from './migrations.js';
import { snapshot, replaceAllData, restoreBackup } from './state.js';
import { toLocalDateTimeStr } from './helpers.js';

// ── Export ──

// iOS home-screen apps ignore <a download>, so share the file instead.
function downloadUnsupported() {
  const iosStandalone = window.navigator.standalone === true;
  return iosStandalone || !('download' in HTMLAnchorElement.prototype);
}

export async function exportData() {
  const data = { app: 'FASTA', exportedAt: new Date().toISOString(), ...snapshot() };
  const name = `fasta-backup-${toLocalDateTimeStr(new Date()).slice(0, 10)}.json`;
  const json = JSON.stringify(data, null, 2);

  if (downloadUnsupported() && navigator.canShare) {
    const file = new File([json], name, { type: 'application/json' });
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'FASTA-backup' });
      } catch (e) {
        if (e.name !== 'AbortError') alert('Det gick inte att dela filen.');
      }
      return;
    }
  }

  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ── Import ──

export function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.onchange = () => {
    if (input.files[0]) handleFile(input.files[0]);
  };
  input.click();
}

async function handleFile(file) {
  let data;
  try {
    const parsed = JSON.parse(await file.text());
    if (!parsed || parsed.app !== 'FASTA' || !Number.isInteger(parsed.schemaVersion)) {
      throw new Error('not a FASTA file');
    }
    data = migrate(parsed);
  } catch (e) {
    if (e instanceof SchemaTooNewError) {
      alert(`Filen kommer från en nyare version av FASTA (dataversion ${e.version}, appen stödjer ${SCHEMA_VERSION}). Ladda om appen för att uppdatera den och försök igen.`);
    } else {
      alert('Filen kunde inte läsas. Välj en backupfil som exporterats från FASTA.');
    }
    return;
  }

  const n = data.events.filter(e => e.type === 'fast').length;
  const msg = `Filen innehåller ${n} ${n === 1 ? 'fasta' : 'fastor'}.\n\nDin nuvarande data ersätts. En kopia sparas så att du kan ångra importen.\n\nFortsätta?`;
  if (!confirm(msg)) return;

  try {
    replaceAllData(data);
  } catch (e) {
    alert('Importen misslyckades. Ingen data har ändrats.');
    return;
  }
  location.reload();
}

export function undoImport() {
  if (!confirm('Återställ datan från före den senaste importen? Den importerade datan ersätts.')) return;
  try {
    restoreBackup();
  } catch (e) {
    alert('Det gick inte att återställa. Ingen data har ändrats.');
    return;
  }
  location.reload();
}
