import type { AstroPhoto } from '../astro-photo';
import { formatAstroDate, formatDecimal, formatExposure } from '../astro-format';

const absent = <span className="text-foreground/30">Not recorded</span>;

export function AstroMetadata({ photo }: { photo: AstroPhoto }) {
  return (
    <div className="border-t border-white/10">
      <details className="group border-b border-white/10">
        <summary className="cursor-pointer py-5 font-mono text-xs tracking-[0.15em] text-foreground/75 uppercase transition-colors marker:text-lime hover:text-lime focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime">
          Capture sessions
          <span className="ml-2 text-foreground/30">{photo.sessions.length}</span>
        </summary>
        <div className="pb-6">
          {(photo.bortle !== null || photo.moonIllumination !== null) && (
            <dl className="mb-5 grid grid-cols-2 gap-4 font-mono text-xs">
              {photo.bortle !== null && (
                <div>
                  <dt className="text-foreground/40">Bortle class</dt>
                  <dd className="mt-1 text-foreground">{formatDecimal(photo.bortle)}</dd>
                </div>
              )}
              {photo.moonIllumination !== null && (
                <div>
                  <dt className="text-foreground/40">Moon illumination</dt>
                  <dd className="mt-1 text-foreground">
                    {Math.round(photo.moonIllumination * 100)}%
                  </dd>
                </div>
              )}
            </dl>
          )}

          {photo.sessions.length > 0 ? (
            <div className="overflow-x-auto border border-white/10">
              <table className="w-full min-w-[900px] border-collapse text-left font-mono text-[11px]">
                <thead className="bg-white/[0.035] text-foreground/40">
                  <tr>
                    {[
                      'Date',
                      'Filter',
                      'Frames',
                      'Exposure / frame',
                      'Integration',
                      'Gain',
                      'Cooling',
                      'Binning',
                      'Moon',
                      'Bortle',
                    ].map((heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className="px-3 py-3 font-normal whitespace-nowrap"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-foreground/70">
                  {photo.sessions.map((session, index) => (
                    <tr
                      key={`${session.date ?? 'unknown'}-${session.filter ?? 'unknown'}-${index}`}
                      className="border-t border-white/10"
                    >
                      <td className="px-3 py-3 whitespace-nowrap">
                        {session.date !== null ? formatAstroDate(session.date) : absent}
                      </td>
                      <td className="px-3 py-3">{session.filter ?? absent}</td>
                      <td className="px-3 py-3">{session.frames ?? absent}</td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        {session.seconds !== null ? formatExposure(session.seconds) : absent}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        {session.frames !== null && session.seconds !== null
                          ? formatExposure(session.frames * session.seconds)
                          : absent}
                      </td>
                      <td className="px-3 py-3">{session.gain ?? absent}</td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        {session.sensorTemperature !== null
                          ? `${formatDecimal(session.sensorTemperature)} °C`
                          : absent}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        {session.binning !== null
                          ? `${session.binning} × ${session.binning}`
                          : absent}
                      </td>
                      <td className="px-3 py-3">
                        {session.moonIllumination !== null
                          ? `${Math.round(session.moonIllumination * 100)}%`
                          : absent}
                      </td>
                      <td className="px-3 py-3">{session.bortle ?? absent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="font-sans text-sm text-foreground/45">Not recorded.</p>
          )}
        </div>
      </details>

      <details className="group border-b border-white/10">
        <summary className="cursor-pointer py-5 font-mono text-xs tracking-[0.15em] text-foreground/75 uppercase transition-colors marker:text-lime hover:text-lime focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime">
          Equipment
        </summary>
        <div className="pb-6">
          {photo.equipment.length > 0 ? (
            <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {photo.equipment.map((group) => (
                <div key={group.label}>
                  <dt className="font-mono text-[10px] tracking-[0.13em] text-foreground/40 uppercase">
                    {group.label}
                  </dt>
                  <dd className="mt-1 font-sans text-sm leading-6 text-foreground/75">
                    {group.items.length > 0 ? group.items.join(', ') : absent}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="font-sans text-sm text-foreground/45">Not recorded.</p>
          )}
        </div>
      </details>

      <details className="group border-b border-white/10">
        <summary className="cursor-pointer py-5 font-mono text-xs tracking-[0.15em] text-foreground/75 uppercase transition-colors marker:text-sky hover:text-sky focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky">
          Sky coordinates
        </summary>
        <div className="pb-6">
          {photo.coordinates !== null ? (
            <dl className="grid grid-cols-2 gap-x-6 gap-y-5 font-mono text-xs">
              <div>
                <dt className="text-foreground/40">Right ascension</dt>
                <dd className="mt-1 text-foreground">{formatDecimal(photo.coordinates.ra, 5)}°</dd>
              </div>
              <div>
                <dt className="text-foreground/40">Declination</dt>
                <dd className="mt-1 text-foreground">
                  {photo.coordinates.dec >= 0 ? '+' : ''}
                  {formatDecimal(photo.coordinates.dec, 5)}°
                </dd>
              </div>
              <div>
                <dt className="text-foreground/40">Field dimensions</dt>
                <dd className="mt-1 text-foreground">
                  {formatDecimal(photo.coordinates.fieldWidth, 4)}° ×{' '}
                  {formatDecimal(photo.coordinates.fieldHeight, 4)}°
                </dd>
              </div>
              <div>
                <dt className="text-foreground/40">Pixel scale</dt>
                <dd className="mt-1 text-foreground">
                  {formatDecimal(photo.coordinates.pixelScale, 3)} arcsec / original pixel
                </dd>
              </div>
              <div>
                <dt className="text-foreground/40">Orientation</dt>
                <dd className="mt-1 text-foreground">
                  {formatDecimal(photo.coordinates.orientation, 3)}°
                </dd>
              </div>
              <div>
                <dt className="text-foreground/40">Constellation</dt>
                <dd className="mt-1 text-foreground">{photo.constellation ?? absent}</dd>
              </div>
            </dl>
          ) : (
            <p className="font-sans text-sm text-foreground/45">Not recorded.</p>
          )}
        </div>
      </details>

      <details className="group border-b border-white/10">
        <summary className="cursor-pointer py-5 font-mono text-xs tracking-[0.15em] text-foreground/75 uppercase transition-colors marker:text-sky hover:text-sky focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky">
          Object names
        </summary>
        <div className="pb-6">
          {photo.objects.length > 0 ? (
            <ul className="flex flex-wrap gap-x-5 gap-y-3">
              {photo.objects.map((object) => (
                <li key={object}>
                  <a
                    href={`https://simbad.u-strasbg.fr/simbad/sim-id?Ident=${encodeURIComponent(object)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-sky transition-colors hover:text-lime focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky"
                  >
                    {object} ↗
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-sans text-sm text-foreground/45">Not recorded.</p>
          )}
        </div>
      </details>
    </div>
  );
}
