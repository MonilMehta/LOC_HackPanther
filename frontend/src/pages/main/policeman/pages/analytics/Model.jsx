import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Check,
  BarChart3,
  LineChart as LineChartIcon,
  TrendingUp,
  Shield,
  ArrowDownCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import data from "./crime_data.json";
import predictiveData from "./predictive_data.json";

const Model = () => {
  // Enhanced state management
  const [chartConfig, setChartConfig] = useState({
    type: "line",
    animate: true,
    stacked: false,
  });
  const [error, setError] = useState(null);
  const [selectedCity, setSelectedCity] = useState("New York");
  const [selectedCrimes, setSelectedCrimes] = useState(["Theft", "Murder"]);
  const [processedData, setProcessedData] = useState([]);
  const [totalsByCrime, setTotalsByCrime] = useState({});
  const [chartType, setChartType] = useState("line");
  const [selectedMetric, setSelectedMetric] = useState("predicted_crime");

  // Optimized data processing with memoization
  const processedCrimeData = useMemo(() => {
    if (!data?.crime_data) {
      setError("No crime data available");
      return [];
    }

    try {
      return data.crime_data
        .filter((entry) => entry.city === selectedCity)
        .map((entry) => ({
          year: entry.year,
          ...entry.crime_counts,
          // Normalize data for better comparison
          normalizedTotal:
            Object.values(entry.crime_counts || {}).reduce((a, b) => a + b, 0) /
            100000,
        }))
        .sort((a, b) => a.year - b.year);
    } catch (err) {
      console.error("Error processing crime data:", err);
      setError("Error processing crime data");
      return [];
    }
  }, [data, selectedCity]);

  // Efficient crime category toggling
  const toggleCrimeCategory = useCallback((category) => {
    setSelectedCrimes((prev) => {
      const isSelected = prev.includes(category);
      if (prev.length === 1 && isSelected) {
        return prev; // Prevent deselecting last category
      }
      return isSelected
        ? prev.filter((c) => c !== category)
        : [...prev, category];
    });
  }, []);

  const getRandomColor = (index) => {
    const colors = [
      "#FF6384", // Red
      "#36A2EB", // Blue
      "#FFCE56", // Yellow
      "#4BC0C0", // Teal
      "#9966FF", // Purple
      "#FF9F40", // Orange
    ];
    return colors[index % colors.length];
  };

  // Enhanced chart rendering with better tooltips and animations
  const renderEnhancedChart = useCallback(() => {
    const ChartComponent = {
      line: LineChart,
      bar: BarChart,
      area: AreaChart,
    }[chartConfig.type];

    if (!ChartComponent) {
      console.warn(`Invalid chart type: ${chartConfig.type}`);
      return null;
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent
          data={processedCrimeData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="year"
            tick={{ fill: "currentColor" }}
            tickLine={{ stroke: "currentColor" }}
          />
          <YAxis
            tick={{ fill: "currentColor" }}
            tickLine={{ stroke: "currentColor" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: "8px",
              border: "1px solid rgba(0, 0, 0, 0.1)",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
            labelStyle={{ fontWeight: "bold" }}
            cursor={{ strokeDasharray: "3 3" }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: "20px",
              fontSize: "14px",
            }}
          />
          {selectedCrimes.map((category, index) => {
            const color = getRandomColor(index);
            return chartConfig.type === "area" ? (
              <Area
                key={category}
                type="monotone"
                dataKey={category}
                name={category}
                fill={color}
                stroke={color}
                fillOpacity={0.2}
                strokeWidth={2}
                animationDuration={500}
                animationBegin={index * 100}
              />
            ) : chartConfig.type === "line" ? (
              <Line
                key={category}
                type="monotone"
                dataKey={category}
                name={category}
                stroke={color}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                animationDuration={500}
                animationBegin={index * 100}
              />
            ) : (
              <Bar
                key={category}
                dataKey={category}
                name={category}
                fill={color}
                opacity={0.8}
                animationDuration={500}
                animationBegin={index * 100}
              />
            );
          })}
        </ChartComponent>
      </ResponsiveContainer>
    );
  }, [processedCrimeData, selectedCrimes, chartConfig]);

  // Enhanced trend calculation with error handling
  const calculateEnhancedTrend = useCallback(
    (metric) => {
      try {
        if (!Array.isArray(predictiveData) || predictiveData.length < 2) {
          return { value: 0, isValid: false };
        }

        const latest = predictiveData[predictiveData.length - 1]?.[metric];
        const previous = predictiveData[predictiveData.length - 2]?.[metric];

        if (!latest || !previous || previous === 0) {
          return { value: 0, isValid: false };
        }

        const trend = ((latest - previous) / previous) * 100;
        return {
          value: trend,
          isValid: true,
          direction: trend > 0 ? "increase" : "decrease",
        };
      } catch (err) {
        console.error(`Error calculating trend for ${metric}:`, err);
        return { value: 0, isValid: false };
      }
    },
    [predictiveData]
  );

  // Render chart controls with improved UI
  const renderChartControls = () => (
    <div className="flex items-center gap-4 mb-4">
      <Tabs
        value={chartConfig.type}
        onValueChange={(value) =>
          setChartConfig((prev) => ({ ...prev, type: value }))
        }
        className="w-full max-w-[300px]"
      >
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="line" className="flex items-center gap-2">
            <LineChartIcon className="w-4 h-4" />
            Line
          </TabsTrigger>
          <TabsTrigger value="bar" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Bar
          </TabsTrigger>
          <TabsTrigger value="area" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Area
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );

  // Error boundary UI
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Get the latest prediction data
  const latestPrediction =
    predictiveData.length > 0
      ? predictiveData[predictiveData.length - 1]
      : {
          predicted_crime: 0,
          safety_index: 0,
          crime_reduction_rate: 0,
          year: new Date().getFullYear(),
        };

  return (
    <div className="space-y-6 p-4">
      {/* Replace existing chart section with enhanced version */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col space-y-4">
            <CardTitle className="flex justify-between items-center">
              <span>Crime Analytics Dashboard ({selectedCity})</span>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-48">
                  <SelectValue>{selectedCity}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {data.cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardTitle>

            <div className="flex flex-wrap gap-2">
              {data.crime_categories.map((category, index) => (
                <button
                  key={category}
                  onClick={() => toggleCrimeCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
                    ${
                      selectedCrimes.includes(category)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                >
                  {selectedCrimes.includes(category) && (
                    <Check className="w-4 h-4 inline-block mr-1" />
                  )}
                  {category}
                </button>
              ))}
            </div>

            {renderChartControls()}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[500px]">{renderEnhancedChart()}</div>
        </CardContent>
      </Card>

      {/* Existing Crime Totals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(totalsByCrime).map(([crime, total]) => (
          <Card key={crime}>
            <CardHeader>
              <CardTitle className="text-lg">{crime}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{total.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Total Cases</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* New Predictions Section */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Crime Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={predictiveData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="predicted_crime"
                  name="Predicted Crime"
                  stroke="#FF6384"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="safety_index"
                  name="Safety Index"
                  stroke="#4BC0C0"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="crime_reduction_rate"
                  name="Reduction Rate"
                  stroke="#36A2EB"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Prediction Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Latest Prediction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {latestPrediction.predicted_crime.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">
              Predicted Cases for {latestPrediction.year}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Safety Index</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {latestPrediction.safety_index.toFixed(1)}
            </div>
            <div className="text-sm text-gray-500">Higher is Safer</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Crime Reduction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {latestPrediction.crime_reduction_rate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500">Year over Year Change</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-teal-50 to-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-teal-500" />
              Safety Index
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {latestPrediction.safety_index.toFixed(1)}
            </div>
            <div className="text-sm text-gray-500">Current Safety Rating</div>
            <div className="mt-2 text-sm">
              <span
                className={`font-medium ${
                  calculateEnhancedTrend("safety_index").value > 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {calculateEnhancedTrend("safety_index").value.toFixed(1)}%
              </span>{" "}
              vs previous year
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowDownCircle className="w-5 h-5 text-blue-500" />
              Crime Reduction Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {latestPrediction.crime_reduction_rate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500">Current Reduction Rate</div>
            <div className="mt-2 text-sm">
              <span
                className={`font-medium ${
                  calculateEnhancedTrend("crime_reduction_rate").value > 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {calculateEnhancedTrend("crime_reduction_rate").value.toFixed(
                  1
                )}
                %
              </span>{" "}
              vs previous year
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Alert for significant changes */}
      {(Math.abs(calculateEnhancedTrend("predicted_crime").value) > 10 ||
        Math.abs(calculateEnhancedTrend("safety_index").value) > 10 ||
        Math.abs(calculateEnhancedTrend("crime_reduction_rate").value) >
          10) && (
        <Alert>
          <AlertDescription>
            Significant changes detected in crime metrics. Please review the
            detailed analysis for more information.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default Model;
