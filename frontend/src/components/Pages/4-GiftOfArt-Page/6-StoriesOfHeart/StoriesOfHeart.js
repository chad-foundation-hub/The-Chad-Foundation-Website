import React, { useState } from "react";
import "./StoriesOfHeart.css";
import GiftOfArtNavigation from "../GiftOfArtNavigation";

// Import a unique photo for each story
import PhotoOne from "../../../../images/GiftOfArt-Images/stories-image1.png";
import PhotoTwo from "../../../../images/GiftOfArt-Images/stories-image2.JPG";
import PhotoThree from "../../../../images/GiftOfArt-Images/stories-image3.jpg";

const StoriesOfHeartCard = ({
  personsName,
  personsSchool,
  photo,
  initialStoryText,
  expandedStoryText,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpansion = () => setIsExpanded(!isExpanded);

  // Split expanded text into paragraphs by blank lines
  const renderParagraphs = (text) =>
    text
      .trim()
      .split(/\n\s*\n/)
      .map((para, idx) => (
        <p key={idx} className="storiesOfHeart-text">
          {para.trim()}
        </p>
      ));

  return (
    <div className="storiesOfHeart-card">
      <img
        src={photo}
        alt={`${personsName}'s story`}
        className={`storiesOfHeart-image ${isExpanded ? "expanded" : ""}`}
      />

      <h4 className="storiesOfHeart-name">{personsName}</h4>
      <p className="storiesOfHeart-school">{personsSchool}</p>

      {/* initial visible text */}
      <p className="storiesOfHeart-text">
        {initialStoryText}
        {!isExpanded && (
          <span
            className="storiesOfHeart-readMore-button"
            onClick={toggleExpansion}
          >
            {" Read more"}
          </span>
        )}
      </p>

      {/* expanded paragraphs */}
      {isExpanded && (
        <div className="storiesOfHeart-expanded">
          {renderParagraphs(expandedStoryText)}
          <span
            className="storiesOfHeart-readMore-button"
            onClick={toggleExpansion}
          >
            {" Read less"}
          </span>
        </div>
      )}
    </div>
  );
};

const StoriesOfHeart = () => {
  return (
    <section className="StoriesOfHeart-Two">
      <GiftOfArtNavigation currentPage="heart-stories" />
      <div className="main-container">
        <p className="storiesOfHeart-p">
          Chad’s friends would ask, “Why is he talking to that ‘stranger’ for
          hours?” Chad had unquenchable curiosity. Whether you were 4 or 94, he
          wanted to know everything about you—who you were, where you came from,
          what you’re doing, and where you’re going. He truly cared about your
          journey. So, STORIES OF THE HEART is just a continuation of Chad’s
          legacy to know more about “you” and your unique Story of the Heart. We
          hope you will enjoy the journey of those you meet!
        </p>

        <h2 className="storiesOfHeart-header">Stories of the Heart</h2>

        <div className="storiesOfHeart-container">
          <StoriesOfHeartCard
            personsName="Phil Dunn, ESQ"
            // personsSchool="ESQ"
            photo={PhotoOne}
            initialStoryText="I discovered lawn bowling for the first time while living in Manchester, England, in 1967. I was
born in England, but I moved to California when I was six and then returned for a visit when I
was 19. During that visit, which lasted eight months, my uncle Bill took me to a lawn bowling
green. We threw the bowl up and down a few times, and I never touched a bowl again or
thought much about it until 2006, 39 years later. I had some fun hitchhiking around France,
England, and Italy, while earning money as a janitor, a soft furnishings salesperson, a door-to-
door encyclopedia salesman, and finally as a bus conductor on the double-decker buses in
Manchester.
"
            expandedStoryText={`I thought about living there, but the reality of being impoverished set in, along
with a dislike for the dreary weather, and I realized that there is no place like the USA. I
discovered in that eye-opening adventure that opportunity was here, not there, and gratefully
returned to California, land of sunshine, surfing, and beautiful women.

I returned to California with new enthusiasm to complete my college education. I successfully
graduated with a Bachelor of Science degree in Business in 1970. Unfortunately, the Vietnam
War was in full swing, and my lottery number was 37, which meant I was going to be drafted
and probably sent to Vietnam. At the time, after a negative run-in with the law, I decided that I
might like to be an attorney. Knowing I would be drafted, I volunteered for the Army, hoping to
survive the war and then use the GI Bill to get through law school. I was pretty poor at the
time, and the G.I. Bill was my only hope for extending my education. The plan worked better
than I could have ever imagined. I was fortunate enough to be able to talk my way into serving
in the Judge Advocate General’s Office (JAG), where several outstanding lawyers educated me
on the fundamentals of being a good lawyer. I was like a sponge while serving as the Chief Law
Clerk, Bailiff, Court Reporter, and on many occasions, sitting at the counsel table assisting either
the prosecution or defense. I survived with only a broken ankle sustained during basic combat
training (enough to be classified as an honorably discharged disabled veteran). There are many
back stories to all these adventures, but unfortunately, not enough space here to go into them
all. Suffice to say that I served my full term in the service, was honorably discharged, and then
made it to law school, which I attended at night, while working during the day for several
judges at the L.A. County Courthouse and Public Defender’s Office. When I graduated, I was
quite experienced, having spent two years in JAG and three years working at the courthouse, so
I was eager to get out there and into a courtroom. I passed the bar the first time, was sworn in
at noon, and appeared at my first hearing at 5 p.m., successfully settling the case for three
times what the attorney for whom I was appearing wanted. A new attorney friend I met a
couple of days after starting work in the same office, noticed that result and asked if I would
like to go into partnership with him. I told him I only had $500 to my name, a desk, and a
typewriter. I asked what he had, and he replied I only have $300, no desk, and no typewriter.
Despite our impoverished condition, we formed the partnership of Dunn & Roth, figuring
neither of us had anything to lose. The practice took off, and almost fifty years later, it still
exists, albeit now with different names in the title. 

I‘m proud to say that I was a highly successful  trial attorney, having tried numerous cases before judges and juries between 1977 and 2009. Winning was important to me, much more than the money. I won well over 90% of all the cases I tried. I attribute my success to having had 25 different jobs in my life before becoming a lawyer. Thus, I could relate to just about
everyone, which is helpful when trying cases before juries and also when interacting with
clients. It was not until I slowed down my trial work that I discovered lawn bowling. I believe
that my competitive nature, developed in the courtroom, helped me succeed on the greens.
In 2006, my sports were karate and tennis. I had attained a second-degree black belt (Nidan) in
Yoshukai Karate and was even teaching, but it required a fair amount of sparring and kicking,
which, at my age of 58, was no longer what I wanted to do. I was also getting tired of getting
hit and kicked in the face. In addition, my hip was starting to feel a little funny, so tennis was
also becoming challenging. While playing tennis at Douglas Park in Santa Monica, my friend
and I stopped by the green and were warmly welcomed. It was July 2006 when this new
adventure began to unfold in my life. Bowling came naturally to me, and although I didn’t play
much the first year, I got hooked when my buddy Amo and I entered the Novice Pairs
tournament held on what was then a grass green at Laguna Woods. Much to our delight, we
won the tournament, and the addiction began. That was followed by winning the U.S. Open
Pairs in 2007, possibly the only person to win a U.S. Open as a novice.

I then met a seasoned bowler named James McGinnes, who advised me that to improve quickly
at bowls, I should participate in as many tournaments as possible. That was sage advice which I
took to heart. In my second year, still as a Novice, I won the novice singles, the Cary, the So Cal
Triples (which I’ve won five more times since then), the Tommy Stirrat, the PBA pairs, the SMBC
singles, among other tournaments, and made team SW honors. Although they didn’t keep
statistics very closely in those years, I believe I ended up either number one in the Southwest or
very close to it. My hard work did not go unrecognized, and Ed Quo, the Chief Team USA
Selector, called me to ask if I would like to play in the World Cup Singles. At the time, I was still
a novice. I was also still quite busy with my law practice, but I wasn’t about to turn down that
honor. Every year, one person from the USA is chosen to compete in the World Cup Singles
tournament. The practice of law would have to take second chair to the World Cup. That was
the beginning of my journey on Team USA and representing the USA around the World. Since
then, I have had the honor of representing the USA in Mainland China, Hong Kong, Australia,
New Zealand, the USA, Canada, Wales, Scotland, England, the Netherlands, and Cyprus.
England, Scotland, and Wales were part of the World Bowls Tour and PBA blue carpet
adventure.

To say bowls took over my life would be an understatement. On 18 occasions, I have been
blessed with the opportunity to compete on the World stage on behalf of the USA. I am both
grateful and humbled by what this sport has brought into my life. More importantly, a
multitude of friendships have been formed during this time period. I often tell new bowlers
that you are going to love this sport because you will make friends with people from all over the
World. In addition, we are all equals out on that playing surface. You could be the local janitor
or the local doctor, and it doesn’t matter. We are all equal on the green, and nobody cares
what you do; they care about how friendly you are and how you play the game.

To give back to the sport that has given me so much, I served on the board at SMBC for five
years, as VP for three years, and as President for one year.  I’m currently the Chair of the SW
Disciplinary Committee and was briefly a Team USA Selector. I also became a certified coach
and umpire. My philosophy is that it is essential in bowls, with so few of us, to volunteer in any
way you can. A club’s success is very much tied to the willingness of its members to help run
the club. My colleague and friend Tom and I are currently co-authoring a book on the sport of lawn bowling. It’s our way of giving back a little to the sport that has given us so much.

- Cheers! Phil
`}
          />

          <StoriesOfHeartCard
            personsName="Yulia Shtofa"
            photo={PhotoTwo}
            initialStoryText="My name is Julia Shtofa. I was born and live in Kyiv, in Ukraine. This is our home and always will be. When Russia attacked our country in February 2022, it was the most frightening and devastating experience of our lives, especially since our newly born son was only 2 years old when the invasion came. My husband’s sister and her husband live in the US and were very upset and offered to move us to a safe country, but we refused to leave. The Ukraine is our homeland and Kyiv is ‘our home,’ and we will do whatever it takes to survive and defend it for as long as it takes. As the war progressed, things got very bad. My sister-in-law asked what she could send us. Even basic things like underwear, socks, and toothbrushes were not available as most of the stores were shuttered. We are very grateful to our American family and the countries of the world who care and support us.
"
            expandedStoryText={`Our spirit is strong and enduring. I recently posted on Instagram that one of my dreams has come true. All my life, I have wanted to learn to drive. In 2025, I completed my driving lessons, took my driver’s test, and passed. Now, I proudly have my driver’s license. Yeah! We don’t have a car yet but when times are better and we can get one, I will be able to drive it. Life and Dreams continue to exist, even in the worst of times.
								
            - Yulia Shtofa, Kyiv, Ukraine
              `}
          />

          <StoriesOfHeartCard
            personsName="Phil Oberlander"
            photo={PhotoThree}
            initialStoryText="I was born in Paris, and my parents moved to Montreal after the German invasion of WW II. My father was a European champ in wrestling for 2 years, on his way to the Olympics when they were boycotted in ‘36. When I grew up, I followed in his footsteps; excelling in wrestling I made it to the Olympic finals.  (I still have cauliflower ears as a permanent signature.)
Always wanting to be a good son, I did all the right things: competitive athletics, finishing college in New York City, marrying, succeeding in a top sales career, even buying a building in Harlem. Living the ‘American dream.’ But somewhere along the road, that dream shattered…big-time and I became all-consumed by the culture of the era, ‘crack cocaine.’ Once attired in Brooks Brothers suits, I was now the owner of a crackhouse and a member of the dark souls of society. I lost it all; I became the pariah of my family.
"
            expandedStoryText={`The thing that saved my life? I had unrelenting friends who cared; successful people who did intervention after intervention. I was in and out of recovery from 1991-2004. Somewhere in that lost soul, I was searching for my self-respect, so I could regain the respect of my family. It was a gut-wrenching journey, many years in the making, but I refound myself and started a new chapter. I went back to college, got my master’s degree in Sociology, and became a Social Worker at the largest Homeless Drop-in Center in New York City. It was these trials through hell that enabled me to understand, inspire, and support the disenfranchised for 20 years and regain the trust and love of my children and family. 

Something else surprising happened when I made the decision to change my life. I always had this dream to be an actor. In fact, I was sometimes told I resemble Anthony Hopkins, and one day the great actor and I passed each other in the street and did a doubletake! Well, it happened that our Director of Development at the Drop-in Center was also an actor. She had written a play called, “All About Sneakers,” and she offered me the role of John, The Gravedigger—the mentor, who helps young Danny through his own challenges. My dream did come true! We performed ‘Sneakers’ at an Off-Broadway venue in the West Village and had special performances set aside for our homeless clients. 

My journey through hell was transformative. I learned life can throw you punches that can keep you knocked out for years. And it is the loyal, caring friends who never give up on you, and your family who need their son, father, husband and friend back that smack you hard and wake you up. It is to them; I am eternally grateful for the rest of my life.
								
- Philip Oberlander
`}
          />
        </div>

        <h3 className="stories-bottom-text">
          If you would like to submit a “Real-Life Story of the Heart,” please
          contact arista@chad-foundation.org.
        </h3>
      </div>
    </section>
  );
};

export default StoriesOfHeart;
