import { Link } from "wouter";

import "./WikiPage.less";
import { useEffect } from "react";

export default function WikiHomepage() {
    useEffect(() => {
        document.title = "Home - Cog-Minder Wiki"
    }), [];

    return (
        <div>
            <p>
                This is a WIP unofficial Cogmind Wiki. Use the page dropdown to go to a specific page. For editing info,
                check out the <a href="https://discord.gg/f8Fqv2qQxV">Cog-Minder wiki Discord server</a> and make
                contributions via{" "}
                <a href="https://docs.google.com/spreadsheets/d/1Fv3WlkoueecEmZDh88XWSMuV8Qdfm3epzFrcx5nF33g/edit?usp=sharing">
                    This Google Spreadsheet
                </a>
                .
            </p>
            <h1>Useful Pages</h1>
            <ul>
                <li>
                    <Link href="/Game Mechanics">Game Mechanics</Link>
                </li>
                <li>
                    <Link href="/Locations">Locations</Link> - Information about all locations in the game
                </li>
                <li>
                    <Link href="/Squad">Squad</Link> - All types of robot squads
                </li>
                <li>
                    <Link href="/Bot Groups">Bot Groups</Link> - List of bot classes/other groups
                </li>
                <li>
                    <Link href="/Non-empty Pages">Non-empty Pages</Link> - List of non-empty pages
                </li>
            </ul>
            <p>Contributors:</p>
            <ul>
                <li>aoemica</li>
                <li>jimmyl</li>
                <li>ktur</li>
                <li>lyrabold</li>
                <li>Rocko1345</li>
            </ul>
        </div>
    );
}
