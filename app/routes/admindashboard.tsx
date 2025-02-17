import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";
import { Link, useLocation, Form } from "@remix-run/react";
import { LogOut } from "lucide-react";
import {
  Box,
  Flex,
  Image,
  Stack,
  Button,
  useColorModeValue,
  Text,
  Container,
} from "@chakra-ui/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Book Your Experience" },
    { name: "description", content: "Book your unique dining experience with us" },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUserId(request);
  return json({});
};

export default function AdminDashboard() {
  const location = useLocation();
  const isRootRoute = location.pathname === "/admindashboard";
  const bgColor = useColorModeValue("blue.50", "blue.900");
  const sidebarBg = useColorModeValue("blue.900", "blue.800");
  const sidebarColor = useColorModeValue("white", "gray.100");
  const linkHoverBg = useColorModeValue("blue.800", "blue.700");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      const link = e.currentTarget as HTMLAnchorElement;
      link.click();
    }
  };

  return (
    <>
    <Flex minH="100vh" bg={bgColor}>
      {/* Admin Sidebar - Fixed */}
      <Box
        w="64"
        bg={sidebarBg}
        color={sidebarColor}
        p="6"
        position="fixed"
        h="100vh"
      >
        <Image src="/logonuevoolga3.png" alt="Olga Travel" h="12" mb="8" />
        <Stack spacing="4" align="stretch">
          <Link
            to="/admindashboard/bookings"
            style={{ textDecoration: "none" }}
          >
            <Box
              py="2"
              px="4"
              rounded="lg"
              transition="all 0.2s"
              bg={location.pathname.includes("/bookings") ? linkHoverBg : "transparent"}
              _hover={{ bg: linkHoverBg }}
              role="menuitem"
              tabIndex={0}
              aria-label="Navigate to bookings"
              onKeyDown={handleKeyDown}
            >
              <Text>Bookings</Text>
            </Box>
          </Link>
        </Stack>
      </Box>

      {/* Main Content - With left margin to account for fixed sidebar */}
      <Box flex="1" ml="64">
        <Container maxW="container.xl" p="8">
          {/* Header with Logout */}
          <Flex justify="space-between" align="center" mb="8">
            <Text fontSize="3xl" fontWeight="bold" color="blue.900">
              Dashboard
            </Text>
            <Form action="/logout" method="post">
              <Button
                type="submit"
                variant="outline"
                leftIcon={<LogOut size={16} />}
                aria-label="Logout from dashboard"
              >
                Logout
              </Button>
            </Form>
          </Flex>

          {/* Content */}
          {isRootRoute ? (
            <Link
              to="/admindashboard/bookings"
              style={{ textDecoration: "none" }}
            >
              <Box
                p="6"
                bg="white"
                rounded="lg"
                shadow="md"
                _hover={{ shadow: "lg" }}
                transition="all 0.2s"
                role="button"
                tabIndex={0}
                aria-label="Navigate to bookings management"
                onKeyDown={handleKeyDown}
              >
                <Text fontSize="xl" fontWeight="semibold" color="blue.800" mb="4">
                  Bookings
                </Text>
                <Text color="gray.600">Manage your bookings and availability</Text>
              </Box>
            </Link>
          ) : null}
        </Container>
      </Box>
    </Flex>
    </>
  );
}
