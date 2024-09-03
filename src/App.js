import React, { useState, useEffect } from 'react';
import { ChakraProvider, Box, VStack, Heading, Tabs, TabList, Tab, Text, Flex, extendTheme, Tooltip, Grid} from "@chakra-ui/react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { motion } from "framer-motion";
import { InfoIcon } from '@chakra-ui/icons';
import Papa from 'papaparse';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC0CB', '#A52A2A', '#DDA0DD', '#FF69B4'];

const MotionBox = motion(Box);

// Custom theme to override Tabs styling and set background color
const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: "#F5F1EA", // Subtle oat color background
      },
    },
  },
  components: {
    Tabs: {
      baseStyle: {
        tab: {
          borderRadius: "full",
          _selected: {
            color: "black",
            bg: "white",
            boxShadow: "md",
          },
        },
        tablist: {
          bg: "#EAE6DF",
          borderRadius: "full",
          p: 1,
        },
      },
    },
  },
});

function App() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState('2024-08-30T09:46:32');
  const [endDate, setEndDate] = useState('2024-09-01T00:00:00');
  const [activeTab, setActiveTab] = useState(0);

  const parseDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  };

  useEffect(() => {
    // Fetch and parse the CSV file
    fetch('/transactions refreshed 9-1.csv')
      .then(response => response.text())
      .then(csvString => {
        Papa.parse(csvString, {
          header: true,
          dynamicTyping: true,
          complete: (result) => {
            const processedData = result.data
              .filter(item => item.creation_date && item.last_activity_date)
              .map(item => ({
                ...item,
                creation_date: parseDate(item.creation_date),
                last_activity_date: parseDate(item.last_activity_date),
                is_fraud: item.is_fraud === 'True'
              }))
              .filter(item => item.creation_date && item.last_activity_date);
            setData(processedData);
            setFilteredData(processedData);
          }
        });
      })
      .catch(error => console.error('Error loading CSV:', error));
  }, []);

  useEffect(() => {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    if (!start || !end) return;

    const filtered = data.filter(item => {
      const itemDate = item.last_activity_date;
      return itemDate >= start && itemDate <= end;
    });
    setFilteredData(filtered);
  }, [startDate, endDate, data]);

  const formatAmount = (amount) => {
    if (amount >= 100000) {
      return `$${(amount / 1000000).toFixed(2)} M`;
    }
    return `$${amount.toFixed(2)}`;
  };

  const getTransactionTypes = () => {
    const typeData = filteredData.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(typeData).map(([name, value]) => ({ name, value }));
  };

  const getTotalAmount = () => {
    const total = filteredData.reduce((sum, item) => sum + item.amount, 0);
    return formatAmount(total);
  };

  const getAverageAmount = () => {
    const avg = filteredData.reduce((sum, item) => sum + item.amount, 0) / filteredData.length;
    return formatAmount(avg);
  };

  const getFraudStats = () => {
    const fraudTransactions = filteredData.filter(item => item.is_fraud);
    const totalFraudAmount = fraudTransactions.reduce((sum, item) => sum + item.amount, 0);
    const fraudPercentage = (fraudTransactions.length / filteredData.length) * 100;
    return {
      count: fraudTransactions.length,
      amount: formatAmount(totalFraudAmount),
      percentage: fraudPercentage.toFixed(2)
    };
  };

  const getStackedBarData = () => {
    const hourlyData = {};
    const start = parseDate(startDate);
    const end = parseDate(endDate);

    if (!start || !end) return [];

    for (let d = new Date(start); d <= end; d.setHours(d.getHours() + 1)) {
      const key = d.toISOString().slice(0, 13); // Group by hour
      hourlyData[key] = { normal: 0, fraud: 0, date: new Date(d) };
    }

    filteredData.forEach(item => {
      const hour = item.last_activity_date.toISOString().slice(0, 13);
      if (hourlyData[hour]) {
        if (item.is_fraud) {
          hourlyData[hour].fraud += 1;
        } else {
          hourlyData[hour].normal += 1;
        }
      }
    });

    return Object.values(hourlyData);
  };

  const handleTabChange = (index) => {
    setActiveTab(index);
  };

  const renderDateWidgets = () => {
    if (activeTab < 2) {
      return (
        <Flex align="center">
          <Text mr={2}>Start Date</Text>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginRight: '16px'}}
          />
          <Text mr={2}>End Date</Text>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{padding: '8px', borderRadius: '4px', border: '1px solid #ccc'}}
          />
        </Flex>
      );
    }
    return null;
  };

  const formatXAxisTick = (tickItem) => {
    const date = new Date(tickItem);
    return date.toLocaleString('en-US', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' });
  };

  return (
    <ChakraProvider theme={theme}>
      <Box p={4}>
        <VStack spacing={4} align="stretch">
          <Flex align="center">
            <Heading as="h1" size="xl">Transaction Dashboard</Heading>
            <Tooltip label="A subset of the transactions is used to reduce compute costs" placement="right">
              <InfoIcon ml={2} color="gray.500" />
            </Tooltip>
          </Flex>
          
          <Flex justify="space-between" align="center">
            <Tabs variant="soft-rounded" colorScheme="gray" size="md" index={activeTab} onChange={handleTabChange}>
              <TabList>
                <Tab>Fraud Insights</Tab>
                <Tab>Transactions</Tab>
              </TabList>
            </Tabs>
            {renderDateWidgets()}
            <Tabs variant="soft-rounded" colorScheme="gray" size="md" index={activeTab - 2} onChange={(index) => handleTabChange(index + 2)}>
              <TabList>
                <Tab>Model</Tab>
                <Tab>Documentation</Tab>
              </TabList>
            </Tabs>
          </Flex>

          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 0 && (
              <Grid templateColumns="1fr 3fr" gap={4}>
                <VStack spacing={4}>
                  <Box p={4} borderWidth={1} borderRadius="lg" w="100%" bg="white">
                    <Heading as="h3" size="md" mb={2}>Fraud Transactions</Heading>
                    <Text fontSize="3xl" fontWeight="bold">{getFraudStats().count}</Text>
                  </Box>
                  <Box p={4} borderWidth={1} borderRadius="lg" w="100%" bg="white">
                    <Heading as="h3" size="md" mb={2}>Total Fraud Amount</Heading>
                    <Text fontSize="3xl" fontWeight="bold">{getFraudStats().amount}</Text>
                  </Box>
                  <Box p={4} borderWidth={1} borderRadius="lg" w="100%" bg="white">
                    <Heading as="h3" size="md" mb={2}>Fraud Percentage</Heading>
                    <Text fontSize="3xl" fontWeight="bold">{getFraudStats().percentage}%</Text>
                  </Box>
                </VStack>
                <Box p={4} borderWidth={1} borderRadius="lg" bg="white">
                  <Flex justify="space-between" align="center" mb={2}>
                    <Box flex={1} /> {/* This empty box pushes the title to the center */}
                    <Heading as="h3" size="md" textAlign="center" flex={2}>Reported Transactions</Heading>
                    <Text fontSize="sm" color="gray.500" fontStyle="italic" flex={1} textAlign="right">
                      last refreshed September 1st 12:00:00 AM
                    </Text>
                  </Flex>
                  <Box height="400px">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getStackedBarData()} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={formatXAxisTick}
                          angle={-45} 
                          textAnchor="end" 
                          height={60} 
                        />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="normal" stackId="a" fill="#90EE90" name="Normal" />
                        <Bar dataKey="fraud" stackId="a" fill="red" name="Fraudulent" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                  <Flex justify="center" mt={2}>
                    <Box borderRadius="full" bg="gray.100" px={4} py={2}>
                      <Legend />
                    </Box>
                  </Flex>
                </Box>
              </Grid>
            )}

            {activeTab === 1 && (
              <Grid templateColumns="1fr 2fr" gap={4}>
                <VStack spacing={4}>
                  <Box p={4} borderWidth={1} borderRadius="lg" w="100%" bg="white">
                    <Heading as="h2" size="md" mb={2}>Total Transaction Amount</Heading>
                    <Text fontSize="3xl" fontWeight="bold">{getTotalAmount()}</Text>
                  </Box>
                  <Box p={4} borderWidth={1} borderRadius="lg" w="100%" bg="white">
                    <Heading as="h2" size="md" mb={2}>Average Transaction Amount</Heading>
                    <Text fontSize="3xl" fontWeight="bold">{getAverageAmount()}</Text>
                  </Box>
                  <Box p={4} borderWidth={1} borderRadius="lg" w="100%" bg="white">
                    <Heading as="h2" size="md" mb={2}>Total Transactions</Heading>
                    <Text fontSize="3xl" fontWeight="bold">{filteredData.length}</Text>
                  </Box>
                  <Box p={4} borderWidth={1} borderRadius="lg" w="100%" bg="white">
                    <Heading as="h2" size="md" mb={2}>Unique Countries</Heading>
                    <Text fontSize="3xl" fontWeight="bold">{new Set(filteredData.map(item => item.country)).size}</Text>
                  </Box>
                </VStack>
                <Box p={4} borderWidth={1} borderRadius="lg" bg="white">
                  <Heading as="h2" size="md" mb={2}>Transaction Types Distribution</Heading>
                  <Box height="400px">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getTransactionTypes()}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={150}
                          fill="#8884d8"
                          label
                        >
                          {getTransactionTypes().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>
              </Grid>
            )}

            {activeTab === 2 && (
              <Box p={4} borderWidth={1} borderRadius="lg" bg="white">
                <Heading as="h2" size="md" mb={2}>Model Information</Heading>
                <Text>Model will be integrated here soon. More on the model in the Documentation.</Text>
                {/* <Image 
                    src="/model demonstration.gif" 
                    alt="Model Demonstration"
                    maxWidth="100%"
                    maxHeight="600px"
                    objectFit="contain"
                  /> */}
              </Box>
            )}

            {activeTab === 3 && (
              <Box p={4} borderWidth={1} borderRadius="lg" bg="white">
                <Heading as="h2" size="md" mb={2}>Documentation</Heading>
                <Box height="600px" width="100%">
                  <iframe
                    src="/7.12 Transaction Fraud Model Documentation.pdf"
                    width="100%"
                    height="100%"
                    style={{ border: "none" }}
                    title="Documentation PDF"
                  />
                </Box>
              </Box>
            )}
          </MotionBox>
        </VStack>
      </Box>
    </ChakraProvider>
  );
}

export default App;