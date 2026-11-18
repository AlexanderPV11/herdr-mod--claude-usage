// Claude account usage bar. Reads ~/.config/herdr-app/data/claude-usage.json, written by
// ~/.claude/herdr-usage-statusline.js (Claude Code's statusLine command).
import { View, div } from "gpui-kit";
import { h_flex } from "gpui-base";
import { readTextFile, appHome, theme } from "herdr";

const STALE = 30 * 60; // seconds without an update before the numbers are marked old

function left(resetsAt, now) {
  const s = Math.max(0, resetsAt - now), d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
  return d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default class ClaudeUsage extends View {
  init(_props, cx) {
    this.data = null; this.error = null;
    this.load(cx);
    cx.timer.every(5000, (cx) => this.load(cx));
  }

  load(cx) {
    cx.spawn(async (cx) => {
      try {
        const text = await readTextFile(`${appHome()}/data/claude-usage.json`);
        this.data = text ? JSON.parse(text) : null; this.error = null;
      } catch (e) { this.data = null; this.error = "unreadable"; }
      cx.notify();
    });
  }

  window(t, label, w, now) {
    if (!w || (w.resets_at && w.resets_at < now)) return h_flex().gap(6).items_center().child(label).child(div().text_color(t.dim).child("–"));
    const pct = Math.max(0, Math.min(100, w.used)), color = pct >= 85 ? t.ansi1 : pct >= 60 ? t.ansi3 : t.ansi2;
    return h_flex().gap(6).items_center()
      .child(label)
      .child(div().w(90).h(6).rounded(3).bg(t.border).overflow_hidden().child(div().w(Math.round(90 * pct / 100)).h(6).rounded(3).bg(color)))
      .child(div().text_color(t.foreground).child(`${Math.round(pct)}%`))
      .when(Boolean(w.resets_at), el => el.child(div().text_color(t.dim).child(`resets in ${left(w.resets_at, now)}`)));
  }

  render() {
    const t = theme(), now = Math.floor(Date.now() / 1000), d = this.data;
    const bar = h_flex().size_full().px(14).gap(18).items_center().bg(t.chrome).border_t(1).border_color(t.border).text_size(11.8).text_color(t.muted)
      .child(div().text_color(t.dim).child("Claude"));
    if (!d) return bar.child(div().text_color(t.dim).child(this.error ? "usage file unreadable" : "No usage data yet — it appears after the first reply in a Claude Code session"));
    const old = now - d.updated > STALE;
    return bar
      .child(this.window(t, "5h", d.five_hour, now))
      .child(this.window(t, "7d", d.seven_day, now))
      .when(old, el => el.child(div().text_color(t.blocked).child(`stale · updated ${Math.floor((now - d.updated) / 60)} min ago`)));
  }
}
