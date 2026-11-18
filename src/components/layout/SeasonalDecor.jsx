import { HalloweenDecor } from './HalloweenDecor';
import { ChristmasDecor } from './ChristmasDecor';

// Picks the decoration layer for the visitor's current date.
// Preview any season with ?season=halloween | christmas | none.
function seasonFor(date) {
    const month = date.getMonth(); // 0 = January
    const day = date.getDate();
    if (month === 9 || (month === 10 && day <= 2)) return 'halloween'; // Oct 1 – Nov 2
    if (month === 10 || month === 11 || (month === 0 && day <= 6)) return 'christmas'; // Nov 3 – Jan 6
    return 'none';
}

function currentSeason() {
    try {
        const override = new URLSearchParams(window.location.search).get('season');
        if (override) return override;
    } catch {
        // Fall through to the date
    }
    return seasonFor(new Date());
}

export function SeasonalDecor() {
    const season = currentSeason();
    if (season === 'halloween') return <HalloweenDecor />;
    if (season === 'christmas') return <ChristmasDecor />;
    return null;
}
