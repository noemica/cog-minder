import { Link } from "wouter";

import "./Pages.less";

export default function AboutPage() {
    return (
        <div className="page-content page-paragraph-container">
            <p>
                Cog-Minder is a helper website for <a href="https://www.gridsagegames.com/cogmind/">Cogmind</a>.
                It has a <Link href="/parts">parts searcher</Link> that takes information from the in-game gallery CSV
                export and turns it into this searchable webpage, a <Link href="/bots">bots bestiary</Link> that lists
                all bots in the game and their stats, a <Link href="/build">build planner</Link> that allows for
                creating a build loadout and viewing stats for it, a <Link href="/combat">combat log analyzer</Link>, a{" "}
                <Link href="/hacks">hacking calculator</Link> that shows hacking success rates, a{" "}
                <Link href="/simulator">combat simulator</Link> that predicts combat outcomes from a collection of
                equipped parts, a <Link href="/rif">RIF reference</Link> for RIF abilities and bot hacking, and an
                unofficial <Link href="/wiki">Wiki</Link>. It should have all items and bots as of Beta 13, let me know
                if anything seems missing.
            </p>
            <p>
                This is an MIT licensed open source project with the source available on{" "}
                <a href="https://github.com/noemica/cog-minder">GitHub</a>.
            </p>
            <p>
                Thanks to Valguris, PI-314, GJ, ZXC, MTF, and Captain Croissandwich from the roguelike discord for
                donating early gallery exports, PlasticHeart for creating the{" "}
                <a href="https://github.com/plhx/cogfont">Cog and Smallcaps font files</a>, and Kyzrati for making
                Cogmind.
            </p>
        </div>
    );
}
