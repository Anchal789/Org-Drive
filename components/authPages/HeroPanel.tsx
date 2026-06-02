import Badge from '@/components/ui/Badge';
import Icon from '@/components/ui/Icon';
import { iconsWithPaths, TG_BLUE } from '@/constants/common-constants';

export default function HeroPanel() {
  return (
    <div className="flex-1 p-8 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-border relative overflow-hidden min-h-100 lg:min-h-screen bg-linear-to-br from-tg-blue/10 to-tg-blue/5">
      <div className="flex items-center gap-2.5 z-10 relative">
        <div className="w-8 h-8 rounded-lg bg-foreground text-background inline-flex items-center justify-center text-sm font-bold">
          OD
        </div>
        <span className="text-[15px] font-semibold">Org Drive</span>
      </div>

      <div className="max-w-95 z-10 relative mt-12 lg:mt-0">
        <Badge
          className={
            'mb-3.5 bg-white shadow-sm border border-solid border-tg-blue/20'
          }
        >
          <span className="w-1.25 h-1.25 rounded-full bg-tg-blue animate-pulse inline-block " />
          <span className="text-[#004260]">Powered by Telegram</span>
        </Badge>
        <h1 className="text-3xl lg:text-4xl font-bold leading-[1.1] tracking-tight mb-3.5 text-foreground">
          Your team's files,
          <br />
          on infinite&nbsp;storage.
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground m-0">
          A Drive-style workspace backed by your own Telegram channel. No seats,
          no per-GB fees. Optional AI when you want it.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          {[
            'Unlimited file storage via your channel',
            'Folder organization & quick share links',
            'Optional AI chat & semantic search',
          ].map((t) => (
            <div
              key={t}
              className="flex items-center gap-2 text-[13px] text-foreground"
            >
              <span className="w-4.5 h-4.5 rounded-full inline-flex items-center justify-center shrink-0 bg-tg-blue">
                <Icon
                  d={iconsWithPaths.check}
                  size={11}
                  stroke={2.5}
                  className="text-white"
                />
              </span>
              {t}
            </div>
          ))}
        </div>
      </div>

      <div className="text-[11px] text-muted-foreground z-10 relative mt-12 lg:mt-0">
        © Org Drive 2026 ·{' '}
        <span className="underline cursor-pointer">Privacy</span> ·{' '}
        <span className="underline cursor-pointer">Terms</span>
      </div>

      <div
        className="absolute -right-20 top-16 w-70 h-70 rounded-full pointer-events-none"
        style={{ border: `1px solid ${TG_BLUE}22` }}
      />
      <div
        className="absolute -right-10 top-32 w-40 h-40 rounded-full pointer-events-none"
        style={{ border: `1px solid ${TG_BLUE}33` }}
      />
    </div>
  );
}
