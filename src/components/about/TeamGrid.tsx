import React from "react";
import SmartImage from "@/components/media/SmartImage";

type Props = {
  className?: string;
};

const TeamGrid: React.FC<Props> = ({ className = "" }) => {
  const team = [
    {
      name: "Sarah van der Berg",
      role: "Co-founder & CEO",
      bio: "Ex-McKinsey, gespecialiseerd in consumer tech en AI-product strategie. Gelooft in rustige technologie.",
      imageId: "team-sarah",
    },
    {
      name: "Tom Janssen",
      role: "Co-founder & CTO",
      bio: "ML-engineer met 8 jaar ervaring in computer vision. Bouwde eerder AI-systemen bij Booking.com.",
      imageId: "team-tom",
    },
    {
      name: "Lisa Chen",
      role: "Lead Designer",
      bio: "UX/UI designer met focus op toegankelijkheid. Werkte eerder bij Spotify en Adyen aan consumer interfaces.",
      imageId: "team-lisa",
    },
  ];

  return (
    <div className={`team-grid-wrap ${className}`}>
      <div className="team-grid stagger-3">
        {team.map((member) => (
          <article key={member.name} className="team-card card flow-sm">
            <figure className="team-avatar">
              <SmartImage
                id={member.imageId}
                kind="generic"
                alt={`Portretfoto van ${member.name}`}
                className="h-full w-full object-cover"
              />
            </figure>
            <div className="team-info">
              <h3 className="team-name">{member.name}</h3>
              <p className="team-role">{member.role}</p>
              <p className="team-bio">{member.bio}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default TeamGrid;