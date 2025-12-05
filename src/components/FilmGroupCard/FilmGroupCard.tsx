import { Box, Card, Heading, Text } from "@mond-design-system/theme";
import type { Group } from "../../types";
import "./FilmGroupCard.css";
import { getTextLengthProps } from "../../utils";
interface FilmGroupCardProps {
  group: Group;
}

export function FilmGroupCard({ group }: FilmGroupCardProps) {
  const textLengthProps = getTextLengthProps(group.connection);
  return (
    <Card className={`film-group-card ${group.color}`}>
      <Box
        display="flex"
        flexDirection="column"
        paddingRight="2"
        paddingLeft="2"
        paddingTop="1"
        paddingBottom="1"
        alignItems="center"
        justifyContent="center"
      >
        <Heading
          level={3}
          size="sm"
          responsive
          color="black.900"
          {...textLengthProps}
        >
          {group.connection}
        </Heading>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "4px",
            rowGap: "1px",
          }}
        >
          {group.items.map((item, index) => {
            return (
              <Text key={item.id} responsive color="black.900" size="sm">
                {item.title}
                {index < group.items.length - 1 && ", "}
              </Text>
            );
          })}
        </div>
      </Box>
    </Card>
  );
}
