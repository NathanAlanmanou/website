import React, { useState, useEffect } from 'react';
import {
  ChakraProvider,
  Box,
  Heading,
  Flex,
  Button,
  Input,
  Select,
  Text,
  VStack,
  HStack,
  Grid,
  GridItem,
  useStyleConfig,
  Spinner,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC0CB', '#A52A2A', '#DDA0DD', '#FF69B4'];

const MotionBox = motion(Box);

const CustomTab = ({ children, isSelected, onClick }) => {
  const styles = useStyleConfig("Button", { variant: "outline" });
  return (
    <Button
      {...styles}
      onClick={onClick}
      borderRadius="full"
      bg={isSelected ? "white" : "gray.100"}
      borderColor={isSelected ? "gray.300" : "transparent"}
      boxShadow={isSelected ? "md" : "none"}
      _hover={{ bg: "white" }}
    >
      {children}
    </Button>
  );
};

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMetric, setSelectedMetric] = useState('amount');
  const [activeTab, setActiveTab] = useState('fraud');
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfError, setPdfError] = useState(null);

  useEffect(() => {
    // In a real application, you would fetch the data from an API or database
    const dummyData = [
      {
        id: '1', amount: 3398.73, customer_id: 'C001', isUnauthorizedOverdraft: 0,
        nameDest: 'DestUser1', nameOrig: 'OrigUser1', newBalanceDest: 10000, newBalanceOrig: 5000,
        oldBalanceDest: 9000, oldBalanceOrig: 8398.73, step: 1, type: 'PAYMENT',
        diffOrig: 3398.73, diffDest: 1000, firstname: 'John', lastname: 'Doe',
        email: 'john@example.com', address: '123 Main St', country: 'USA',
        last_country_logged: 'USA', creation_date: '2023-01-01', last_activity_date: '2023-07-08',
        age_group: 2, is_fraud: false, countryOrig: 'US', countryOrig_name: 'United States',
        countryLongOrig_long: -95.7129, countryLatOrig_lat: 37.0902,
        countryDest: 'CA', countryDest_name: 'Canada',
        countryLongDest_long: -106.3468, countryLatDest_lat: 56.1304
      },
      {
        id: '2', amount: 50000.00, customer_id: 'C002', isUnauthorizedOverdraft: 1,
        nameDest: 'DestUser2', nameOrig: 'OrigUser2', newBalanceDest: 75000, newBalanceOrig: 0,
        oldBalanceDest: 25000, oldBalanceOrig: 50000, step: 2, type: 'TRANSFER',
        diffOrig: 50000, diffDest: 50000, firstname: 'Jane', lastname: 'Smith',
        email: 'jane@example.com', address: '456 Elm St', country: 'UK',
        last_country_logged: 'FR', creation_date: '2022-06-15', last_activity_date: '2023-07-09',
        age_group: 3, is_fraud: true, countryOrig: 'GB', countryOrig_name: 'United Kingdom',
        countryLongOrig_long: -3.4359, countryLatOrig_lat: 55.3781,
        countryDest: 'FR', countryDest_name: 'France',
        countryLongDest_long: 2.2137, countryLatDest_lat: 46.2276
      }
    ];
    setData(dummyData);
    setFilteredData(dummyData);
  }, []);

  useEffect(() => {
    const filtered = data.filter(item => {
      const itemDate = new Date(item.last_activity_date);
      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date(8640000000000000); // Max date
      return itemDate >= start && itemDate <= end;
    });
    setFilteredData(filtered);
  }, [startDate, endDate, data]);

  const getTransactionTypes = () => {
    const typeData = filteredData.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(typeData).map(([name, value]) => ({ name, value }));
  };

  const getTotalAmount = () => {
    return filteredData.reduce((sum, item) => sum + item.amount, 0).toFixed(2);
  };

  const getAverageAmount = () => {
    return (filteredData.reduce((sum, item) => sum + item.amount, 0) / filteredData.length).toFixed(2);
  };

  const getFraudStats = () => {
    const fraudTransactions = filteredData.filter(item => item.is_fraud);
    const totalFraudAmount = fraudTransactions.reduce((sum, item) => sum + item.amount, 0);
    const fraudPercentage = (fraudTransactions.length / filteredData.length) * 100;
    return {
      count: fraudTransactions.length,
      amount: totalFraudAmount.toFixed(2),
      percentage: fraudPercentage.toFixed(2)
    };
  };

  const getScatterData = () => {
    return filteredData.map(item => ({
      x: item.amount,
      y: item.diffOrig,
      z: item.is_fraud ? 100 : 50,
      name: item.country
    }));
  };

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPdfError(null);
  }

  function onDocumentLoadError(error) {
    console.error('Error while loading document:', error);
    setPdfError('Failed to load PDF. Please try again later.');
  }

  return (
    <ChakraProvider>
      <Box p={4}>
        <VStack spacing={4} align="stretch">
          <Heading as="h1" size="xl">Transaction Dashboard</Heading>
          
          <Flex justify="space-between">
            <HStack spacing={2} bg="gray.100" p={1} borderRadius="full">
              <CustomTab
                isSelected={activeTab === 'fraud'}
                onClick={() => setActiveTab('fraud')}
              >
                Fraud Insights
              </CustomTab>
              <CustomTab
                isSelected={activeTab === 'transactions'}
                onClick={() => setActiveTab('transactions')}
              >
                Transactions
              </CustomTab>
            </HStack>
            <HStack spacing={2} bg="gray.100" p={1} borderRadius="full">
              <CustomTab
                isSelected={activeTab === 'model'}
                onClick={() => setActiveTab('model')}
              >
                Model
              </CustomTab>
              <CustomTab
                isSelected={activeTab === 'documentation'}
                onClick={() => setActiveTab('documentation')}
              >
                Documentation
              </CustomTab>
            </HStack>
          </Flex>

          {(activeTab === 'fraud' || activeTab === 'transactions') && (
            <Flex my={4} gap={4}>
              <Box flex={1}>
                <Text mb={2}>Start Date</Text>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Box>
              <Box flex={1}>
                <Text mb={2}>End Date</Text>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Box>
              <Box flex={1}>
                <Text mb={2}>Metric</Text>
                <Select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                >
                  <option value="amount">Amount</option>
                  <option value="count">Count</option>
                </Select>
              </Box>
            </Flex>
          )}

          <AnimatePresence mode="wait">
            <MotionBox
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'fraud' && (
                <VStack spacing={4} align="stretch">
                  <Box p={4} borderWidth={1} borderRadius="lg">
                    <Heading as="h3" size="md" mb={2}>Transaction Amount vs Balance Difference</Heading>
                    <Box height="400px">
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                          <CartesianGrid />
                          <XAxis type="number" dataKey="x" name="Amount" unit="$" />
                          <YAxis type="number" dataKey="y" name="Balance Difference" unit="$" />
                          <ZAxis type="number" dataKey="z" range={[50, 400]} name="Fraud" unit="" />
                          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                          <Legend />
                          <Scatter name="Transactions" data={getScatterData()} fill="#8884d8" />
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
                        <Text fontSize="3xl" fontWeight="bold">${getFraudStats().amount}</Text>
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

              {activeTab === 'transactions' && (
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
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>
                  <Grid templateColumns="repeat(4, 1fr)" gap={4}>
                    <GridItem>
                      <Box p={4} borderWidth={1} borderRadius="lg">
                        <Heading as="h2" size="md" mb={2}>Total Transaction Amount</Heading>
                        <Text fontSize="3xl" fontWeight="bold">${getTotalAmount()}</Text>
                      </Box>
                    </GridItem>
                    <GridItem>
                      <Box p={4} borderWidth={1} borderRadius="lg">
                        <Heading as="h2" size="md" mb={2}>Average Transaction Amount</Heading>
                        <Text fontSize="3xl" fontWeight="bold">${getAverageAmount()}</Text>
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

              {activeTab === 'model' && (
                <Box p={4} borderWidth={1} borderRadius="lg">
                  <Heading as="h2" size="md" mb={2}>Model Information</Heading>
                  <Text>This tab is currently blank and will contain model information in the future.</Text>
                </Box>
              )}

{activeTab === 'documentation' && (
                <Box p={4} borderWidth={1} borderRadius="lg">
                  <Heading as="h2" size="md" mb={2}>Documentation</Heading>
                  <Box 
                    borderWidth={1}
                    borderRadius="md"
                    height="600px"
                    overflow="hidden"
                  >
                    <embed 
                      src={`${process.env.PUBLIC_URL}/placeholder.pdf`}
                      type="application/pdf"
                      width="100%"
                      height="100%"
                    />
                  </Box>
                </Box>
              )}
            </MotionBox>
          </AnimatePresence>
        </VStack>
      </Box>
    </ChakraProvider>
  );
};

export default Dashboard;