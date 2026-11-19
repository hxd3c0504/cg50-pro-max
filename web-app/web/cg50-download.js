// Read decoded bytes: the release manifest records uncompressed file sizes.
async function cg50ReadDownload(response, size, onBytes) {
  if (!Number.isSafeInteger(size) || size < 0 || size > 36 * 1024 * 1024) throw Error("VERIFY");
  if (!response.body || !onBytes) {
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength !== size) throw Error("VERIFY");
    onBytes?.(size);
    return bytes;
  }
  const reader = response.body.getReader();
  const bytes = new Uint8Array(size);
  let offset = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      if (offset + chunk.value.byteLength > size) {
        await reader.cancel();
        throw Error("VERIFY");
      }
      bytes.set(chunk.value, offset);
      offset += chunk.value.byteLength;
      onBytes(offset);
    }
  } finally {
    reader.releaseLock();
  }
  if (offset !== size) throw Error("VERIFY");
  return bytes.buffer;
}

function cg50DownloadMeter(status) {
  const box = document.createElement("div");
  box.className = "cg50-download-meter";
  const bar = document.createElement("progress");
  bar.setAttribute("aria-labelledby", status.id);
  const numbers = document.createElement("div");
  const amount = document.createElement("span"), percent = document.createElement("strong");
  numbers.append(amount, percent);
  box.append(bar, numbers);
  box.hidden = true;
  status.after(box);
  return {
    update(done, total) {
      if (!(total > 0)) return;
      box.hidden = false;
      bar.max = total;
      bar.value = done;
      amount.textContent = (done / 1e6).toFixed(1) + " / " + (total / 1e6).toFixed(1) + " MB";
      percent.textContent = Math.floor(100 * done / total) + "%";
    },
    hide() { box.hidden = true; }
  };
}
