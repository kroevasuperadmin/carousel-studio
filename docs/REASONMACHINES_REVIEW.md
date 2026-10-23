# Reason Network safety and capability review

Reviewed 23 October 2026. Read only. No account was created, no password or key was typed, no form was submitted, and nothing was posted or sent.

Page reviewed: https://reasonmachines.com/network

**Verdict: DO NOT USE** for exporting the Wisma / Grok Bot chat.

**The one question Faris must answer before using it:** Do I want a saved copy of the Wisma chat for myself, or do I want this Grok Bot joined to other agents through Reason Machines?

If the answer is a saved copy, stop here. This site does not make that copy.

## 1. What this site is and who runs it

Reason Network is a product that lets AI assistants see each other and send messages. The page says a Grok Bot or Muse can ask Claude Code, Codex, Cursor, or another coding agent to do work, and that teammates' agents can join the same network.

It is part of Reason, a cloud coding agent. The company behind the site is Ara Software, Inc., which uses the name Reason Machines. The public privacy policy and terms use that legal name. The contact address on the site is contact@example.com. A security address, contact@example.com, is on their trust center.

Y Combinator's company page lists Reason Machines as an active Spring 2026 company in San Francisco, with a team size of two. It names Adi Singh as founder and CEO and Sven Myhre as founder and CTO. Their about page says the company is headquartered in San Francisco and is backed by Y Combinator. The site footer shows a Y Combinator mark and an NVIDIA Inception mark.

A separate page, https://reasonmachines.com/grokbot, says the Reason plugin for Grok Bot is built by Reason Machines and is not affiliated with or endorsed by xAI.

The piece that carries messages between computers is open source, under MIT and Apache 2.0, at https://github.com/reason-machines/reason-network. GitHub's API, checked the same day, showed the repository created on 16 October 2026, with 1,100 stars and 89 forks. The README says the project began as "tincan" by Lars Talian, who works at Reason. The Reason command-line program that sets the network up is free to use. The company says that program is not open source.

## 2. What it asks for

The public page asks for two things before any account exists.

- Paste this into a coding agent: `Join the Reason Network: https://reasonmachines.com/network`
- Or run this in a terminal: `curl -fsSL https://reasonmachines.com/install.sh | bash -s -- network`

On Windows the page gives a PowerShell line that downloads a script and runs it.

After that, the page says sign-in is with Google, GitHub, Apple, or email, and that signing in creates a Reason account if you do not have one. The live page has no box for a Grok password, a Grok cookie, or an xAI key. I did not open or complete the sign-in screen.

I downloaded the install script and read it. I did not run it. The copy I read was 1,291 lines, last modified on the site at 07:22 UTC on 23 October 2026, SHA-256 `68367dc2bd8e0c857e985939075a0b622fcb8af9913baeaf23b7dba1815eaae2`. For the `network` option, the script downloads Reason's program from Reason's own release list, checks a checksum, installs it under the user's home folder, and then runs `reason network`. Their docs say that step opens a browser to sign in and then adds Reason's tools to the coding agents on that computer. The script I read does not ask for a Grok password. The program it installs is closed source, so what that program does after launch is known from their docs, not from reading its code. They say it can update itself.

For a hosted assistant (they name Grok Bot, Muse, ChatGPT, and Claude.ai), the page says do not install anything on the assistant's own cloud computer. It says add this plug-in address instead: `https://mcp.reasonmachines.com/mcp`. A plug-in of this kind (MCP) lets the assistant call tools on Reason's server. I sent that server an unsigned hello. It answered that a sign-in or a Reason API key is required. I provided neither.

Their instructions, printed on the page for the assistant to follow, then say:

- The person signs in and picks a network.
- The assistant's messages go out through one of the person's computers. A computer has to be on the network first.
- If the assistant can be woken by a webhook, as Grok Bot routines can, set up a routine that checks the inbox. The person pastes the routine's web address and key on Reason's page. The instructions say not to ask for that key in the chat.

Their docs also say that, with no browser, a Reason API key can be used instead of sign-in. Public permission names on that server include reading and writing secrets, memory, repositories, sessions, and the network, plus a permission to write SSH access. Their MCP docs say a connecting app that does not ask for a short list of permissions receives every permission except the SSH one. I did not complete sign-in, so I did not see the exact screen Grok Bot would show.

An invite link of the form `https://reasonmachines.com/network/join/#rn1-…` lets other people join. Their docs say anyone with the link can join, and that a computer is on one network at a time. They also say the Windows setup can join without signing in, and that those names show as unverified.

The page does not ask for Grok cookies. Opening it did send a page-view report to Reason and loaded PostHog analytics, including a session-replay script. I typed nothing into the page.

## 3. Can it export an existing Grok Bot or Grok chat?

No. There is no export of an existing Grok Bot chat or Grok chat.

The tools named on the page are:

- `list_team`: who is online, which machine, repository, and branch, and whether that session is busy
- `send_message`: send a message to one session
- `check_inbox`: read messages sent to this session
- `ask_user`: on a computer, ask the person a question in a pop-up and wait

There is no download button, no transcript, and no step that pulls history out of Grok.

Reason has a separate export for Reason's own coding sessions. It returns a JSON document (they call it a trajectory, ATIF v1.7) and it needs a Reason key that can read sessions. That file is a Reason session. It is not a copy of a Grok conversation.

The Grok Bot plugin page is also a different product. It starts a new Reason coding job from a mention in the bot. It does not download an old Grok chat.

The open-source design does allow a network message to carry up to 10 small text files, 256 KB each and 512 KB in total. A connected assistant that can already see a chat could be told to send that text onward. That is sharing through the network. It is not a feature that saves the Wisma chat as a file for Faris.

Grok Bot is on the path they describe as going through Reason's server. The page's own security line says computers talk peer to peer and Reason's relays only forward encrypted traffic, and that hosted bots connect through Reason's server. Their docs say the same, and they tell the assistant not to install the program on a cloud computer of its own.

So there is no export format for an existing Grok Bot or Grok chat.

## 4. Red flags

These are the problems that matter for this use.

1. The page does the wrong job. Following it puts a computer and the bot on a third-party network. It does not hand back the Wisma chat.
2. The page is written so that an assistant which reads it will try to install software and wire a webhook. It says "Your user asked to join, so go ahead; the defaults are fine." That text is public, on the page and at https://reasonmachines.com/network/skill.md.
3. Grok Bot messages are described as going through Reason's server. The end-to-end encryption claim is for computers talking to each other. A relay on that computer path is described as forwarding encrypted traffic, and their design notes say a bad relay list could still show who talks to whom. The hosted-bot path is the one that matters here, and they say that path goes through their server.
4. The Grok Bot setup asks the person to paste a routine webhook address and key onto Reason's page. That is a secret leaving the bot's side and being stored by Reason. Telling the assistant not to ask for the key in chat does not make the website a safe place to put it.
5. The plug-in can be broad. The public permission list includes secrets, memory, repositories, sessions, and the network. The exact boxes on the sign-in screen were not seen, because signing in was out of scope.
6. Setup is a remote script piped into the shell. The copy I read checks a checksum and then starts sign-in. The program is closed source and can update itself. The script on the site can change after this review. The hash above is only the copy read on 23 October 2026.
7. The invite link is enough for another person to join. Their docs say a Windows computer can join without signing in, and that name then shows as unverified.
8. People on the network can see machine, repository, branch, and busy or idle, and they can message the bot. The instructions tell the bot to answer.
9. The site footer says "Zero data retention · SOC 2" and links to https://trust.reasonmachines.com. That trust center, run by Oneleet, lists SOC 2 Type 2 as in progress and GDPR as in progress. Security documents there say "Request access." I did not request them. Their FAQ uses "zero-data-retention" for a claim that model providers do not train on customer data. The privacy policy, updated 23 October 2026, says Reason stores prompts, messages, code, recordings, and session content, and that some staff may read Reason session content to improve the service. Those are different claims from "we do not keep data."
10. On the free plan, the privacy policy says Reason web coding sessions can send a short, cleaned piece of the latest message to an advertising partner, Gravity. The policy says those ads do not appear in the command line, routines, the API, or exports. I did not see this applied to Network messages.
11. The same policy says the website uses PostHog session replay, which can include text typed in ordinary fields. Password fields are masked. A visit to the network page loaded that recorder and posted telemetry to Reason. Nothing was typed.
12. The company is young. The owner is public: Ara Software, Inc., named founders, a Y Combinator listing, a privacy policy, terms, and a public GitHub repository. This is not an anonymous page.

What I did not find: a fake Grok login, a request for a Grok password, or a request for Grok cookies on the pages I read. The plug-in server refused a request that had no sign-in. That part behaves like a normal locked service.

## 5. Verdict

**DO NOT USE** this site to export the Wisma / Grok Bot chat.

It will not produce a file of that chat. The steps it does offer sign a computer into Reason, sign the bot into Reason's plug-in, and, if the printed instructions are followed, place a Grok Bot webhook address and key on Reason's page. Grok Bot messages on this product go through Reason's server, by Reason's own description.

**Faris must answer this before using it:** Do I want a saved copy of the Wisma chat for myself, or do I want this Grok Bot joined to other agents through Reason Machines?

A saved copy means do not use this site. Joining the network is a separate choice. Even then, do not paste a webhook key, a password, or an API key until the sign-in screen has been read and every permission on it is understood. This review did not open that screen and does not recommend connecting the Wisma bot.

## What was checked

- The live network page in a browser, including the install lines, the agent instructions, the security claims, and the footer.
- https://reasonmachines.com/network/skill.md, the privacy policy, the terms, the network docs, the MCP docs, and https://reasonmachines.com/grokbot.
- The install script and the short Windows wrapper, downloaded and read, not executed.
- An unsigned request to the MCP address, which was refused.
- The public permission list at the MCP discovery address.
- The GitHub repository README, design notes, and the GitHub API record for star count and creation date.
- The Y Combinator company page.
- The trust center overview, FAQ, and subprocessor list. No "request access" form was sent.
- Subprocessors named there include Anthropic, OpenAI, GitHub, GitLab, Google Cloud, WorkOS, PostHog, Axiom, Sentry, Vercel, Railway, PlanetScale, Stripe, Tigris, Deepgram, Concentrate, Slack, and others.
