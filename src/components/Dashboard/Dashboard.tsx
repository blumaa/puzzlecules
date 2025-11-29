import React from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Heading,
  Text,
  Card,
  Icon,
  CardBody,
} from "@mond-design-system/theme";
import "./Dashboard.css";

interface DashboardLink {
  path: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const ConnectionTypesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2L2 7L12 12L22 7L12 2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 17L12 22L22 17"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 12L12 17L22 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const GenerateIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const GroupPoolIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect
      x="3"
      y="3"
      width="7"
      height="7"
      rx="1"
      stroke="currentColor"
      strokeWidth="2"
    />
    <rect
      x="14"
      y="3"
      width="7"
      height="7"
      rx="1"
      stroke="currentColor"
      strokeWidth="2"
    />
    <rect
      x="3"
      y="14"
      width="7"
      height="7"
      rx="1"
      stroke="currentColor"
      strokeWidth="2"
    />
    <rect
      x="14"
      y="14"
      width="7"
      height="7"
      rx="1"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

const BuildPuzzleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PuzzleQueueIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect
      x="3"
      y="4"
      width="18"
      height="18"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
    />
    <line
      x1="16"
      y1="2"
      x2="16"
      y2="6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="8"
      y1="2"
      x2="8"
      y2="6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="3"
      y1="10"
      x2="21"
      y2="10"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

const DASHBOARD_LINKS: DashboardLink[] = [
  {
    path: "/admin/connection-types",
    label: "Connection Types",
    description: "Manage AI connection types for group generation",
    icon: <ConnectionTypesIcon />,
  },
  {
    path: "/admin/generate",
    label: "Generate Groups",
    description: "Generate new film groups using AI",
    icon: <GenerateIcon />,
  },
  {
    path: "/admin/groups",
    label: "Group Pool",
    description: "View and manage approved groups",
    icon: <GroupPoolIcon />,
  },
  {
    path: "/admin/build",
    label: "Build Puzzle",
    description: "Create puzzles from approved groups",
    icon: <BuildPuzzleIcon />,
  },
  {
    path: "/admin/puzzles",
    label: "Puzzle Queue",
    description: "Schedule and manage puzzles",
    icon: <PuzzleQueueIcon />,
  },
];

export function AdminDashboard() {
  return (
    <Box display="flex" flexDirection="column" gap="lg" padding="4">
      <Box display="flex" flexDirection="column" gap="sm">
        <Heading level={1} size="2xl">
          Puzzlecules Dashboard
        </Heading>
      </Box>

      <Box
        display="flex"
        flexWrap="wrap"
        gap="xs"
      >
        {DASHBOARD_LINKS.map((link) => (
          <Link key={link.path} to={link.path} className="dashboard-card-link">
            <Card className="dashboard-card" hoverable variant="elevated">
              <CardBody>
                <Box
                  display="flex"
                  flexDirection="column"
                  justifyContent="center"
                >
                  <Box display="flex" alignItems="center" gap="md">
                    <Icon size="lg" decorative>
                      {link.icon}
                    </Icon>
                    <Heading level={3} size="md">
                      {link.label}
                    </Heading>
                  </Box>
                  <Text size="sm">{link.description}</Text>
                </Box>
              </CardBody>
            </Card>
          </Link>
        ))}
      </Box>
    </Box>
  );
}
