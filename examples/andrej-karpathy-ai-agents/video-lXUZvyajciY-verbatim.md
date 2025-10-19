# Verbatim Transcript (Markdown)

- Source: https://www.youtube.com/watch?v=lXUZvyajciY
- Language: en
- Retrieved: 2025-10-18

## Timed Versions

For timestamped versions of this transcript:
- **[SRT format](./video-lXUZvyajciY.srt)** (215.91 KB) - For video players and subtitle software
- **[VTT format](./video-lXUZvyajciY.vtt)** (206.42 KB) - WebVTT format for web players
- **[JSON format](./video-lXUZvyajciY-segments.json)** (294.06 KB) - Structured data with 1,806 segments

---

Today I'm speaking with Andrej Karpathy.
Andrej, why do you say that this will be the decade of agents and not the year of agents?
First of all, thank you for having me here. I'm excited to be here. The quote you've just 
mentioned, "It's the decade of agents," is actually a reaction to a pre-existing quote.
I'm not actually sure who said this but they were alluding to this being the year of agents with 
respect to LLMs and how they were going to evolve. I was triggered by that because there's some 
over-prediction going on in the industry. In my mind, this is more accurately 
described as the decade of agents. We have some very early agents that 
are extremely impressive and that I use daily—Claude and Codex and so on—but I 
still feel there's so much work to be done. My reaction is we'll be working 
with these things for a decade. They're going to get better, 
and it's going to be wonderful. I was just reacting to the 
timelines of the implication. What do you think will take a decade to 
accomplish? What are the bottlenecks? Actually making it work. When you're talking 
about an agent, or what the labs have in mind and maybe what I have in mind as well, you 
should think of it almost like an employee or an intern that you would hire to work with you.
For example, you work with some employees here. When would you prefer to have an agent like 
Claude or Codex do that work? Currently, of course they can't. What would it 
take for them to be able to do that? Why don't you do it today?
The reason you don't do it today is because they just don't work.
They don't have enough intelligence, they're not multimodal enough, they 
can't do computer use and all this stuff. They don't do a lot of the things you've 
alluded to earlier. They don't have continual learning. You can't just tell 
them something and they'll remember it. They're cognitively lacking 
and it's just not working. It will take about a decade to 
work through all of those issues. Interesting. As a professional podcaster 
and a viewer of AI from afar, it's easy for me to identify what's lacking: continual 
learning is lacking, or multimodality is lacking. But I don't really have a good way 
of trying to put a timeline on it. If somebody asks how long continual learning 
will take, I have no prior about whether this is a project that should take 5 
years, 10 years, or 50 years. Why a decade? Why not one year? Why not 50 years?
This is where you get into a bit of my own intuition, and doing a bit of an extrapolation 
with respect to my own experience in the field. I've been in AI for almost two decades.
It's going to be 15 years or so, not that long. You had Richard Sutton here, 
who was around for much longer. I do have about 15 years of experience of people 
making predictions, of seeing how they turned out. Also I was in the industry for 
a while, I was in research, and I've worked in the industry for a while. I have a general intuition 
that I have left from that. I feel like the problems are tractable, they're 
surmountable, but they're still difficult. If I just average it out, it 
just feels like a decade to me. This is quite interesting. I want 
to hear not only the history, but what people in the room felt was about to 
happen at various different breakthrough moments. What were the ways in which their feelings were 
either overly pessimistic or overly optimistic? Should we just go through each of them one by one?
That's a giant question because you're talking about 15 years of stuff that happened.
AI is so wonderful because there have been a number of seismic shifts where the entire 
field has suddenly looked a different way. I've maybe lived through two or three of those.
I still think there will continue to be some because they come with 
almost surprising regularity. When my career began, when I started to work on 
deep learning, when I became interested in deep learning, this was by chance of being right next 
to Geoff Hinton at the University of Toronto. Geoff Hinton, of course, is 
the godfather figure of AI. He was training all these neural networks.
I thought it was incredible and interesting. This was not the main thing that 
everyone in AI was doing by far. This was a niche little subject on the side.
That's maybe the first dramatic seismic shift that came with the AlexNet and so on.
AlexNet reoriented everyone, and everyone started to train neural networks, but it 
was still very per-task, per specific task. Maybe I have an image classifier or I have a 
neural machine translator or something like that. People became very slowly interested in agents.
People started to think, "Okay, maybe we have a check mark next to the visual cortex or something 
like that, but what about the other parts of the brain, and how can we get a full agent or a 
full entity that can interact in the world?" The Atari deep reinforcement learning shift 
in 2013 or so was part of that early effort of agents, in my mind, because it was an 
attempt to try to get agents that not just perceive the world, but also take actions and 
interact and get rewards from environments. At the time, this was Atari games.
I feel that was a misstep. It was a misstep that even the early OpenAI that 
i was a part of adopted because at that time, the zeitgeist was reinforcement learning 
environments, games, game playing, beat games, get lots of different types of 
games, and OpenAI was doing a lot of that. That was another prominent part of AI where maybe 
for two or three or four years, everyone was doing reinforcement learning on games.
That was all a bit of a misstep. What I was trying to do at OpenAI is 
i was always a bit suspicious of games as being this thing that would lead to AGI.
Because in my mind, you want something like an accountant or something that's 
interacting with the real world. I just didn't see how games add up to it.
My project at OpenAI, for example, was within the scope of the Universe project, on an agent that 
was using keyboard and mouse to operate web pages. I really wanted to have something that 
interacts with the actual digital world that can do knowledge work.
It just so turns out that this was extremely early, way too early, so early 
that we shouldn't have been working on that. Because if you're just stumbling your way around 
and keyboard mashing and mouse clicking and trying to get rewards in these environments, your 
reward is too sparse and you just won't learn. You're going to burn a forest 
computing, and you're never going to get something off the ground.
What you're missing is this power of representation in the neural network.
For example, today people are training those computer-using agents, but they're 
doing it on top of a large language model. You have to get the language model first, 
you have to get the representations first, and you have to do that by all the 
pre-training and all the LLM stuff. I feel maybe loosely speaking, people 
kept trying to get the full thing too early a few times, where people really try 
to go after agents too early, I would say. That was Atari and Universe 
and even my own experience. You actually have to do some things 
first before you get to those agents. Now the agents are a lot more competent, but maybe 
we're still missing some parts of that stack. I would say those are the three major 
buckets of what people were doing: training neural nets per-tasks, 
trying the first round of agents, and then maybe the LLMs and seeking the 
representation power of the neural networks before you tack on everything else on top.

[Transcript truncated for brevity… full content saved in file]
