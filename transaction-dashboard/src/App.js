import React, { useState, useEffect } from 'react';
import { ChakraProvider, Box, VStack, Heading, Tabs, TabList, TabPanels, Tab, TabPanel, Input, Select, Grid, GridItem, Text, Flex, HStack, extendTheme, Tooltip } from "@chakra-ui/react";
import { PieChart, Pie, Cell, ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { motion } from "framer-motion";
import { InfoIcon } from '@chakra-ui/icons';
import Papa from 'papaparse';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC0CB', '#A52A2A', '#DDA0DD', '#FF69B4'];

const MotionBox = motion(Box);

// Custom theme to override Tabs styling
const theme = extendTheme({
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
          bg: "#F0F0F0",
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
  const [startDate, setStartDate] = useState('2024-06-29T09:46:32');
  const [endDate, setEndDate] = useState('2024-07-01T00:00:00');
  // const [selectedMetric, setSelectedMetric] = useState('amount');
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    // Fetch and parse the CSV file
    fetch('/transactions refreshed 7-1.csv')
      .then(response => response.text())
      .then(csvString => {
        Papa.parse(csvString, {
          header: true,
          dynamicTyping: true,
          complete: (result) => {
            // Convert string dates to Date objects and boolean strings to actual booleans
            const processedData = result.data.map(item => ({
              ...item,
              creation_date: new Date(item.creation_date),
              last_activity_date: new Date(item.last_activity_date),
              is_fraud: item.is_fraud === 'True'
            }));
            console.log('Processed Data:', processedData); // Debug log
            setData(processedData);
            setFilteredData(processedData);
          }
        });
      })
      .catch(error => console.error('Error loading CSV:', error));
  }, []);

  useEffect(() => {
    const filtered = data.filter(item => {
      const itemDate = new Date(item.last_activity_date);
      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date(8640000000000000); // Max date
      return itemDate >= start && itemDate <= end;
    });
    console.log('Filtered Data:', filtered); // Debug log
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

  const getScatterData = () => {
    return filteredData.map(item => ({
      x: item.amount,
      y: item.oldBalanceOrig,
      fill: item.is_fraud ? 'red' : '#90EE90', // dull green if not fraud
      name: item.country
    }));
  };

  const handleTabChange = (index) => {
    setActiveTab(index);
  };

  const renderDateWidgets = () => {
    if (activeTab < 2) {
      return (
        <Flex my={4}>
          <Box flex={1} mr={2}>
            <Text mb={2}>Start Date</Text>
            <Input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Box>
          <Box flex={1} mx={2}>
            <Text mb={2}>End Date</Text>
            <Input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Box>
          {/* Metric Widget commented out
          <Box flex={1} ml={2}>
            <Text mb={2}>Metric</Text>
            <Select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
            >
              <option value="amount">Amount</option>
              <option value="count">Count</option>
            </Select>
          </Box>
          */}
        </Flex>
      );
    }
    return null;
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
          
          <HStack spacing={4} align="start" justifyContent="space-between">
            <Tabs variant="soft-rounded" colorScheme="gray" size="md" index={activeTab} onChange={handleTabChange}>
              <TabList>
                <Tab>Fraud Insights</Tab>
                <Tab>Transactions</Tab>
              </TabList>
            </Tabs>
            <Tabs variant="soft-rounded" colorScheme="gray" size="md" index={activeTab - 2} onChange={(index) => handleTabChange(index + 2)}>
              <TabList>
                <Tab>Model</Tab>
                <Tab>Documentation</Tab>
              </TabList>
            </Tabs>
          </HStack>

          {renderDateWidgets()}

          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 0 && (
              <VStack spacing={4} align="stretch">
                <Box p={4} borderWidth={1} borderRadius="lg">
                  <Flex justify="space-between" align="center" mb={2}>
                    <Heading as="h3" size="md">Reported Transactions</Heading>
                    <Text fontSize="sm" color="gray.500" fontStyle="italic">last refreshed July 1st 12:00:00 AM</Text>
                  </Flex>
                  <Box height="400px">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid />
                        <XAxis type="number" dataKey="x" name="Amount" unit="$" label={{ value: "Transaction Amount", position: "bottom" }} />
                        <YAxis type="number" dataKey="y" name="Original Balance" label={{ value: "Original Balance", angle: -90, position: "left" }} />
                        <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Legend payload={[
                          { value: 'Fraudulent', type: 'circle', color: 'red' },
                          { value: 'Normal', type: 'circle', color: '#90EE90' }
                        ]}/>
                        <Scatter name="Transactions" data={getScatterData()} fill="#8884d8" shape="circle" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>
                <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                  <GridItem>
                    <Box p={4} borderWidth={1} borderRadius="lg">
                      <Heading as="h3" size="md" mb={2}>Fraud Transactions</Heading>
                      <Text fontSize="3xl" fontWeight="bold">{getFraudStats().count}</Text>
                    </Box>
                  </GridItem>
                  <GridItem>
                    <Box p={4} borderWidth={1} borderRadius="lg">
                      <Heading as="h3" size="md" mb={2}>Total Fraud Amount</Heading>
                      <Text fontSize="3xl" fontWeight="bold">{getFraudStats().amount}</Text>
                    </Box>
                  </GridItem>
                  <GridItem>
                    <Box p={4} borderWidth={1} borderRadius="lg">
                      <Heading as="h3" size="md" mb={2}>Fraud Percentage</Heading>
                      <Text fontSize="3xl" fontWeight="bold">{getFraudStats().percentage}%</Text>
                    </Box>
                  </GridItem>
                </Grid>
              </VStack>
            )}

            {activeTab === 1 && (
              <VStack spacing={4} align="stretch">
                <Box p={4} borderWidth={1} borderRadius="lg">
                  <Heading as="h2" size="md" mb={2}>Transaction Types Distribution</Heading>
                  <Box height="300px">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getTransactionTypes()}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
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
                <Grid templateColumns="repeat(4, 1fr)" gap={4}>
                  <GridItem>
                    <Box p={4} borderWidth={1} borderRadius="lg">
                      <Heading as="h2" size="md" mb={2}>Total Transaction Amount</Heading>
                      <Text fontSize="3xl" fontWeight="bold">{getTotalAmount()}</Text>
                    </Box>
                  </GridItem>
                  <GridItem>
                    <Box p={4} borderWidth={1} borderRadius="lg">
                      <Heading as="h2" size="md" mb={2}>Average Transaction Amount</Heading>
                      <Text fontSize="3xl" fontWeight="bold">{getAverageAmount()}</Text>
                    </Box>
                  </GridItem>
                  <GridItem>
                    <Box p={4} borderWidth={1} borderRadius="lg">
                      <Heading as="h2" size="md" mb={2}>Total Transactions</Heading>
                      <Text fontSize="3xl" fontWeight="bold">{filteredData.length}</Text>
                    </Box>
                  </GridItem>
                  <GridItem>
                    <Box p={4} borderWidth={1} borderRadius="lg">
                      <Heading as="h2" size="md" mb={2}>Unique Countries</Heading>
                      <Text fontSize="3xl" fontWeight="bold">{new Set(filteredData.map(item => item.country)).size}</Text>
                    </Box>
                  </GridItem>
                </Grid>
              </VStack>
            )}

            {activeTab === 2 && (
              <Box p={4} borderWidth={1} borderRadius="lg">
                <Heading as="h2" size="md" mb={2}>Model Information</Heading>
                <Text>This tab is currently blank and will contain model information in the future.</Text>
              </Box>
            )}

            {activeTab === 3 && (
              <Box p={4} borderWidth={1} borderRadius="lg">
                <Heading as="h2" size="md" mb={2}>Documentation</Heading>
                <Text>This tab is currently blank and will contain documentation in the future.</Text>
              </Box>
            )}
          </MotionBox>
        </VStack>
      </Box>
    </ChakraProvider>
  );
}

export default App;